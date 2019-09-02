'use strict';

const browserSync       = require('browser-sync').create();
const clean             = require('gulp-clean');
const gulp              = require('gulp');
const autoprefixer      = require('autoprefixer');
const purge             = require('gulp-css-purge');
const eslint            = require('gulp-eslint');
const npmDist           = require('gulp-npm-dist');
const postcss           = require('gulp-postcss');
const sass              = require('gulp-sass');
const sourcemaps        = require('gulp-sourcemaps');
const splitMediaQueries = require('gulp-split-media-queries');
const stylelint         = require('gulp-stylelint');
const uglify            = require('gulp-uglify');
const yaml              = require('gulp-yaml-validate');

const config = {
  paths: {
    sass: './sass/**/*.scss',
    css: './css/',
    jsSrc: './js/src/*.js',
    jsDist: './js/dist/',
    img: './images/',
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
function cssCleanTask() {
  return gulp
    .src(config.paths.css, { read: false })
    .pipe(clean());
}

/**
 * SASS:Development Task
 *
 * Sass task for development with live injecting into all browsers
 * @return {object} Autoprefixed CSS files with expanded style and sourcemaps.
 */
function sassDevTask() {
  return gulp
    .src(config.paths.sass)
    .pipe(sourcemaps.init({ largeFile: true }))
    .pipe(sass({ outputStyle: 'expanded', precision: 10 }))
    .on('error', sass.logError)
    .pipe(postcss([autoprefixer()]))
    .pipe(sourcemaps.write({ includeContent: false }))
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(config.paths.css))
    .pipe(browserSync.stream());
}

/**
 * SASS:Production Task
 *
 * Sass task for production with linting, to be stored in Git (run before
 * commit)
 * @return {object} Autoprefixed, minified, ordered and linted* CSS files without
 * sourcemaps.
 */
function sassProdTask() {
  return gulp
    .src(config.paths.sass)
    .pipe(stylelint({
      fix: true,
      reporters: [
        {
          formatter: 'verbose',
          console: true,
        },
      ],
    }))
    .pipe(sass({ outputStyle: 'compact', precision: 10 }))
    .on('error', sass.logError)
    .pipe(postcss([autoprefixer()]))
    .pipe(splitMediaQueries({
      breakpoint: config.cssSplitting.breakpoint,
    }))
    .pipe(
      purge({
        trim: true,
        shorten: true,
        verbose: true
      })
    )
    .pipe(gulp.dest(config.paths.css));
}

/**
 * SASS:Linting Task
 *
 * @return {object} Linted version of SASS (auto fixable) and warnings printed to
 * console.
 */
function sassLintTask() {
  return gulp
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
}

/**
 * JavaScript Task
 *
 * Currently there is only one JavaScript task (no separated for dev and prod).
 * @return {object} Linted (auto fixable, warnings printed to console about
 * others) and minified JavaScript files.
*/
function scriptsTask() {
  return gulp
    .src(config.paths.jsSrc)
    .pipe(eslint({ fix: true }))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
    .pipe(uglify())
    .pipe(gulp.dest(config.paths.jsDist))
    .pipe(browserSync.stream());
}

/**
 * JavaScript:Linting Task
 *
 * @return {object} Linted (auto fixable, warnings printed to console about
 * others) JavaScript files.
*/
function scriptsLintTask() {
  return gulp
    .src(config.paths.jsSrc)
    .pipe(eslint({ fix: true }))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
}

/**
 * YAML:Linting Task
 *
 * @return {object} Linted YAML config files.
 */
function yamlLintTask() {
  return gulp
    .src('./*.yml')
    .pipe(yaml({ safe: true }));
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
  gulp.watch(config.paths.sass, sassDevTask);
  gulp.watch(config.paths.jsSrc, scriptsTask);
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
var compileTask = gulp.parallel(sassDevTask, scriptsTask);
var compileProdTask = gulp.parallel(sassProdTask, scriptsTask);

// export tasks
exports.default = gulp.series(copyVendorTask, cssCleanTask, compileTask, browserSyncTask);
exports.prod = gulp.series(copyVendorTask, cssCleanTask, compileProdTask);
exports.lint = gulp.parallel(sassLintTask, scriptsLintTask, yamlLintTask);
exports.vendors = copyVendorTask;
exports.sassDev = sassDevTask;
exports.sassProd = sassProdTask;
exports.sassLint = sassLintTask;
exports.scripts = scriptsTask;
exports.scriptsLint = scriptsLintTask;
exports.watch = browserSyncTask;
exports.yamlLint = yamlLintTask;
