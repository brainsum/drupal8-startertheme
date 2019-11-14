'use strict';

const autoprefixer      = require('autoprefixer');
const browserSync       = require('browser-sync').create();
const critical          = require('drupalcritical');
const gulp              = require('gulp');
const clean             = require('gulp-clean');
const cleanCSS          = require('gulp-clean-css');
const eslint            = require('gulp-eslint');
const npmDist           = require('gulp-npm-dist');
const postcss           = require('gulp-postcss');
const sass              = require('gulp-sass');
const sourcemaps        = require('gulp-sourcemaps');
const splitMediaQueries = require('gulp-split-media-queries');
const stylelint         = require('gulp-stylelint');
const uglify            = require('gulp-uglify');

const config = {
  paths: {
    styles: {
      src: './sass/**/*.scss',
      dest: './css/',
    },
    scripts: {
      src: './js/src/*.js',
      dest: './js/dist/'
    },
    images: {
      src: './images/src/*',
      dest: './images/dist'
    }
  },
  // Desktop/tablet media queries in a separated CSS file.
  cssSplitting: {
    // If you change this, change it in libraries.yaml too!
    breakpoint: 48, // 768px and above (from your mqs, here we use in ems)
  },
  browserSync: {
    proxy: 'projectname.test',
    autoOpen: false,
    browsers: [
      'Google Chrome',
    ],
  },
  critical: {
    inline: false,
    local: false,
    dest: './css/',
    extract: false,
    ignore: [
      '@font-face',
      /url\(/,
      /print/,
      /animation/g,
      /interpolation/g,
      /-webkit/g,
      /-moz/g,
      /-ms/g,
      /speak/g,
      /list-style-image/g,
      /list-style-type/g
    ],
    ignoreOptions: {
      matchSelectors: true,
      matchTypes: true,
      matchDeclarationProperties: true,
      matchDeclarationValues: true,
      matchMedia: true
    },
    dimensions: [ // define different viewport sizes
      {
        height: 200,
        width: 500
      }, {
        height: 900,
        width: 1200
      }
    ]
  },
  pages: require('./critical.json') // define here page types
};

/**
 * Copy:dependencies Task
 *
 * from npm_modules to ./public/vendors/
 * @see https://github.com/dshemendiuk/gulp-npm-dist
 * @return {object} Copied distributed version of vendor assets.
 */
function copyVendorTask() {
  return gulp
    .src(npmDist(), { base: './node_modules' })
    .pipe(gulp.dest('./vendors/'));
}

/**
 * CSS: Cleaning Task
 *
 * Remove all compiled CSS file to make a clean start before Sass tasks and
 * avoid duplicated and conflicted CSS rules.
 * @return {object} empty directory
 */
function cssCleanTask(done) {
  gulp
    .src(config.paths.styles.dest, {
      read: false,
      allowEmpty: true
    })
    .pipe(clean());
  done();
}

/**
 * SASS:Development Task
 *
 * Sass task for development with live injecting into all browsers
 * @return {object} Autoprefixed CSS files with expanded style and sourcemaps.
 */
function sassDevTask(done) {
  return gulp
    .src(config.paths.styles.src)
    .pipe(sourcemaps.init({ largeFile: true }))
    .pipe(sass({
      outputStyle: 'expanded',
      precision: 10
    }))
    .on('error', sass.logError)
    .pipe(postcss([autoprefixer()]))
    .pipe(sourcemaps.write({ includeContent: false }))
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(config.paths.styles.dest))
    .pipe(browserSync.stream());
  done();
}

/**
 * SASS:Production Task
 *
 * Sass task for production with linting, to be stored in Git (run before
 * commit)
 * @return {object} Autoprefixed, minified, ordered and linted* CSS files without
 * sourcemaps.
 */
function sassProdTask(done) {
  gulp
    .src(config.paths.styles.src)
    .pipe(stylelint({
      fix: true,
      reporters: [
        {
          formatter: 'verbose',
          console: true,
        },
      ],
    }))
    .pipe(sass({
      outputStyle: 'compact',
      precision: 10
    }))
    .on('error', sass.logError)
    .pipe(postcss([autoprefixer()]))
    .pipe(splitMediaQueries({
      breakpoint: config.cssSplitting.breakpoint,
    }))
    .pipe(cleanCSS({
      compatibility: {
        colors: {
          opacity: true
        },
        units: {
          rem: true,
          vh: true,
          vm: true,
          vmax: true,
          vmin: true
        }
      },
      level: 2
    }))
    .pipe(gulp.dest(config.paths.styles.dest));
  done();
}

/**
 * SASS:Linting Task
 *
 * @return {object} Linted version of SASS (auto fixable) and warnings printed to
 * console.
 */
function sassLintTask(done) {
  gulp
    .src(config.paths.sass)
    .pipe(stylelint({
      fix: true,
      reporters: [
        {
          formatter: 'verbose',
          console: true,
        },
      ],
    }));
  done();
}


/**
 * Critical CSS Task
 *
 * Generate & Inline Critical-path CSS.
 * @return {object} Critical CSS files for defined page types.
 */
gulp.task('critical', gulp.series(sassProdTask, function criticalFn(done) {
  critical.generate(config.critical, config.pages);
  done();
}));

/**
 * JavaScript Task
 *
 * Currently there is only one JavaScript task (no separated for dev and prod).
 * @return {object} Linted (auto fixable, warnings printed to console about
 * others) and minified JavaScript files.
*/
function scriptsTask(done) {
  gulp
    .src(config.paths.scripts.src)
    .pipe(eslint({ fix: true }))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
    .pipe(uglify())
    .pipe(gulp.dest(config.paths.scripts.dest))
    .pipe(browserSync.stream());
  done();
}

/**
 * JavaScript:Linting Task
 *
 * @return {object} Linted (auto fixable, warnings printed to console about
 * others) JavaScript files.
*/
function scriptsLintTask(done) {
  gulp
    .src(config.paths.scripts.src)
    .pipe(eslint({ fix: true }))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
  done();
}

/**
 * BrowserSync Task
 *
 * Watching Sass and JavaScript source files for changes.
 * @prop {string} proxy Change it for your local setup.
 * @param {function} done Changed event.
 */
function browserSyncTask(done) {
  browserSync.init({
    proxy: config.browserSync.proxy,
    open: config.browserSync.autoOpen,
    browser: config.browserSync.browsers,
  });
  gulp.watch(config.paths.styles.src, sassDevTask);
  gulp.watch(config.paths.scripts.src, scriptsTask);
  done();
}

/**
 * BrowserSync Reload Task
 *
 * BrowserSync will reload all synced browsers.
 * @param {function} done Reload event.
 */
function browserSyncReloadTask(done) {
  browserSync.reload();
  done();
}

// Define complex tasks
const compileTask = gulp.parallel(sassDevTask, scriptsTask);
const compileProdTask = gulp.parallel(sassProdTask, scriptsTask);

// export tasks
exports.default = gulp.series(copyVendorTask, cssCleanTask, compileTask, browserSyncTask);
exports.prod = gulp.series(copyVendorTask, cssCleanTask, compileProdTask);
exports.lint = gulp.parallel(sassLintTask, scriptsLintTask);
exports.vendors = copyVendorTask;
exports.sassDev = sassDevTask;
exports.sassProd = sassProdTask;
exports.sassLint = sassLintTask;
exports.scripts = scriptsTask;
exports.scriptsLint = scriptsLintTask;
exports.watch = browserSyncTask;
// critical - not need exported here, but here is to complete tasks list
