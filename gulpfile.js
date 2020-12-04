'use strict';

/**
 * Import required node modules and other external files
 */
var autoprefixer         = require('autoprefixer');
var browserSync         = require('browser-sync').create();
var critical            = require('drupalcritical');
var Fiber               = require('fibers');
var gulp                = require('gulp');
var eslint              = require('gulp-eslint');
var postcss             = require('gulp-postcss');
var sass                = require('gulp-sass');
var sourcemaps          = require('gulp-sourcemaps');
var stylelint           = require('gulp-stylelint');
var customProperties    = require('postcss-custom-properties');
var criticalConfig       = require('./critical.json');

/**
 * Gulp config
 */
var config = {
  paths: {
    styles: {
      src: './sass/**/*.scss',
      dest: './css/'
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
      'Google Chrome'
    ]
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
    // define different viewport sizes
    dimensions: [
      {
        height: 200,
        width: 500
      }, {
        height: 900,
        width: 1200
      }
    ]
  },
  // define here page types
  pages: criticalConfig
};

// Predefined complex Gulp tasks
var compileTask = '';

/**
 * Sass settings
 *
 * Set Sass compiler. There are two options:
 * - require('sass') for Dart Sass
 * - require('node-sass') for Node Sass (LibSass)
 */
sass.compiler = require('sass');

/**
 * SASS:Development Task
 *
 * Sass task for development with live injecting into all browsers
 * @param {string} done The done argument is passed into the callback function;
 * executing that done function tells Gulp "a hint to tell it when the task is done".
 */
function sassCompileTask(done) {
  gulp
    .src(config.paths.styles.src)
    .pipe(stylelint({
      fix: true,
      reporters: [
        {
          formatter: 'verbose',
          console: true
        }
      ]
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
 * Run only StyleLint task to check errors.
 * @param {string} done The done argument is passed into the callback function;
 * executing that done function tells Gulp "a hint to tell it when the task is done".
 */
function sassLintTask(done) {
  gulp
    .src(config.paths.styles.src)
    .pipe(stylelint({
      fix: true,
      reporters: [
        {
          formatter: 'verbose',
          console: true
        }
      ]
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
 * And only run ESlint to detect errors.
 * @param {string} done The done argument is passed into the callback function;
 * executing that done function tells Gulp "a hint to tell it when the task is done".
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
 * BrowserSync Task
 *
 * Watching Sass and JavaScript source files for changes.
 * @param {string} done The done argument is passed into the callback function;
 * executing that done function tells Gulp "a hint to tell it when the task is done".
 */
function browserSyncTask(done) {
  browserSync.init({
    proxy: config.browserSync.proxy,
    open: config.browserSync.autoOpen,
    browser: config.browserSync.browsers
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
compileTask = gulp.parallel(sassCompileTask, scriptsTask);

/**
 * Export Gulp tasks
*/
exports.default = gulp.series(compileTask, browserSyncTask);
exports.lint = gulp.parallel(sassLintTask, scriptsTask);
exports.sass = sassCompileTask;
exports.sassLint = sassLintTask;
exports.scripts = scriptsTask;
exports.watch = browserSyncTask;
// critical - not need exported here, but here is to complete tasks list
