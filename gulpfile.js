'use strict';

/**
 * Import required node modules
 */
const autoprefixer         = require('autoprefixer');
const browserSync         = require('browser-sync').create();
const critical            = require('drupalcritical');
const Fiber               = require('fibers');
const gulp                = require('gulp');
const eslint              = require('gulp-eslint');
const postcss             = require('gulp-postcss');
const sass                = require('gulp-sass');
const sourcemaps          = require('gulp-sourcemaps');
const stylelint           = require('gulp-stylelint');
const customProperties    = require('postcss-custom-properties');

/**
 * Sass settings
 *
 * Set Sass compiler. There are two options:
 * - require('sass') for Dart Sass
 * - require('node-sass') for Node Sass (LibSass)
 */
sass.compiler             = require('sass');

/**
 * Gulp config
 */
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
 * SASS:Development Task
 *
 * Sass task for development with live injecting into all browsers
 * @return {object} Autoprefixed CSS files with expanded style and sourcemaps.
 */
function sassCompileTask(done) {
  return gulp
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
    .pipe(sourcemaps.init({ largeFile: true }))
    .pipe(sass({
      fiber: Fiber,
      outputStyle: 'expanded',
      precision: 10
    }))
    .on('error', sass.logError)
    .pipe(postcss([
      customProperties(),
      autoprefixer()
    ]))
    .pipe(sourcemaps.write({ includeContent: false }))
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(config.paths.styles.dest))
    .pipe(browserSync.stream());
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
    .src(config.paths.styles.src)
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
gulp.task('critical', gulp.series(sassCompileTask, function criticalFn(done) {
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
  gulp.watch(config.paths.styles.src, sassCompileTask);
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
const compileTask = gulp.parallel(sassCompileTask, scriptsTask);

// export tasks
exports.default = gulp.series(compileTask, browserSyncTask);
exports.lint = gulp.parallel(sassLintTask, scriptsLintTask);
exports.sass = sassCompileTask;
exports.sassLint = sassLintTask;
exports.scripts = scriptsTask;
exports.scriptsLint = scriptsLintTask;
exports.watch = browserSyncTask;
// critical - not need exported here, but here is to complete tasks list
