'use strict';

var browserSync = require('browser-sync').create();
var gulp = require('gulp');
var autoprefixer = require('gulp-autoprefixer');
var purge = require('gulp-css-purge');
var csscomb = require('gulp-csscomb');
var eslint = require('gulp-eslint');
var npmDist = require('gulp-npm-dist');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var stylelint = require('gulp-stylelint');
var uglify = require('gulp-uglify');
var yaml = require('gulp-yaml-validate');

// Store all paths
var paths = {
  sass: './sass/**/*.scss',
  css: './css/',
  jsSrc: './js/src/*.js',
  jsDist: './js/dist/',
  img: './images/'
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
 * SASS:Development Task
 *
 * Sass task for development with live injecting into all browsers
 * @return {object} Autoprefixed CSS files with expanded style and sourcemaps.
 */
function sassDevTask() {
  return gulp
    .src(paths.sass)
    .pipe(sourcemaps.init({ largeFile: true }))
    .pipe(sass({ outputStyle: 'expanded', precision: 10 }))
    .on('error', sass.logError)
    .pipe(sourcemaps.write({ includeContent: false }))
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(
      autoprefixer({
        browsers: ['last 3 version', 'ie >= 10']
      })
    )
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(paths.css))
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
    .src(paths.sass)
    .pipe(stylelint({
      fix: true,
      reporters: [
        { formatter: 'verbose', console: true }
      ]
    }))
    .pipe(sass({ outputStyle: 'compact', precision: 10 }))
    .on('error', sass.logError)
    .pipe(
      autoprefixer({
        browsers: ['last 3 version', 'ie >= 10']
      })
    )
    .pipe(csscomb())
    .pipe(
      purge({
        trim: true,
        shorten: true,
        verbose: true
      })
    )
    .pipe(gulp.dest(paths.css));
}

/**
 * SASS:Linting Task
 *
 * @return {object} Linted version of SASS (auto fixable) and warnings printed to
 * console.
 */
function sassLintTask() {
  return gulp
    .src(paths.sass)
    .pipe(stylelint({
      fix: true,
      reporters: [
        { formatter: 'verbose', console: true }
      ]
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
    .src(paths.jsSrc)
    .pipe(eslint({ fix: true }))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
    .pipe(uglify())
    .pipe(gulp.dest(paths.jsDist))
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
    .src(paths.jsSrc)
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
    proxy: 'projectname.test',
    open: false
  });
  gulp.watch(paths.sass, sassDevTask);
  gulp.watch(paths.jsSrc, scriptsTask);
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
exports.default = gulp.series(copyVendorTask, compileTask, browserSyncTask);
exports.prod = gulp.series(copyVendorTask, compileProdTask);
exports.lint = gulp.parallel(sassLintTask, scriptsLintTask, yamlLintTask);
exports.vendors = copyVendorTask;
exports.sassDev = sassDevTask;
exports.sassProd = sassProdTask;
exports.sassLint = sassLintTask;
exports.scripts = scriptsTask;
exports.scriptsLint = scriptsLintTask;
exports.watch = browserSyncTask;
exports.yamlLint = yamlLintTask;
