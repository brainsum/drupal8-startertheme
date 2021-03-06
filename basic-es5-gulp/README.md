# BRAINSUM's Drupal 8 startertheme

* Created by: [Krisztian Pinter](kpinter@brainsum.com)
* Created in: 2019.
* Updated on: 2020.12.10.

## Table of Contents

* About
* What will you need to work with this theme?
* Installation
* Usage
* Structure
* Coding Standards

## About

Drupal 8 startertheme based on core's Classy base theme. Build process powered
by [Gulp.js 4](https://gulpjs.com/docs/en/getting-started/quick-start) and asset
files (sass, css, js) structured, linted and compiled according to Drupal Coding
Standards. You can equally run build processes by gulp commands or npm scripts.

## What will you need to work with this theme?

* Installed Composer
* Installed Drush
* Installed Drupal 8-9 via Composer
* Set asset-packagist to composer.json
* Installed node.js (min. v13)
* Installed npm

## Installation

You will need **node.js**, **npm**, **gulp-cli (min 4.0.0)** globally installed
to working with this startertheme.

```bash
cd {project}/web/themes/custom/
git clone git@github.com:brainsum/drupal8-startertheme.git projectname_theme
cd projectname_theme
npm install
```

## Usage

We use here Gulp.js 4 as task runner. You can run the gulp tasks directly with
gulp, like `gulp sass` or with package.json's scripts: `npm start` or
`npm run start`. In both you can choose from the following tasks:

```bash
# run sass, scripts then watch and BrowserSync
start
# run sass; no watch, BrowserSync in this way
sass
# Linting sass files
sassLint
# Complile Sass files then create critical css files.
critical
# run scripts task; no watch, BrowserSync in this way
scripts
```

In Gulp.js there is some extra tasks too. **Before you can run a BrowserSync
task (ex. `start` one), you need to edit `proxy` setting in the `browserSync`
config!**

## Structure

Theme's structure based on Drupal 8 coding standards and theme recommendations:

* `css` directory: for all compiled css files (not commit map files)
* `fonts` directory: for webfonts
* `images` directory: for all theme images and graphics
* `js` directory: for all JavaScript files*
* `node_modules` directory: we need install all required frontend vendor
libraries here
* `sass` directory: Source sass files
* `templates` directory: all twig templates in Drupal module based structure

### Sass structure

We use SMACSS and ITCSS here for structuring all sass files. We gave numbers too
for category order:

* `1.settings`: all settings file
* `2.tools`: general mixins and sass functions
* `3.base`: css reset and element (html5 tags) styling
* `4.layout`: all grid and page layout related things
* `5.components`: reusable blocks (try to use it more and more)
* `6.utilities`: utility helper classes; mostly from `2.tools`

To theming pages and __unique__ blocks we use `theme.scss` file. All files and
some directories are empty, just show how you should organize sass files.
The created files mostly just samples, you can add and remove them as project
needs.

### Generate Critical CSS

To ensure initial faster page loads we can generate a bunch of css only what
user will see at first when the page loaded. Like in newspapers, that's when it's
called 'above the the fold' too. See more about Critical CSS in
[Web Dev](https://web.dev/extract-critical-css/). We provided a generator tool for
that. You need to config at first: define screen sizes in `gulpfile.js` and provide the
different type of pages in `critical.json` file. It will run a headless Google Chrome
to check the HTML, then generate a CSS file for them (by default into:
`./templates/includes/inline/`).
**Then You only one thing have to do: Include them as inline CSS into `html.html.twig`
Twig templates.** Ex.:

``` php
<style>{{source('@theme_name/includes/inline/critical-css.css', ignore_missing = true)}}</style>
```

### JavaScripts structure

Our all JavaScript files will go to `js` directory. We work from `src` directory
and place the processed js files to `dist` directory. Currently we only proceed
an ESlint checkout.

### Third party assets

If you need to install any third party library please install that via composer
and attach as a library. For example, if you want to install
[Lity](https://sorgalla.com/lity/) as lightbox:

Search for in Asset Packagist repository: https://asset-packagist.org/. If you
find that, you will see it's an npm or bower package, then install them via
Composer:

```shell script
composer require npm-asset/lity
```

It will install all assets into `libraries/` directory, so we can add it
very easily into a library:

```yaml
lightbox:
  version: 2.4.1
  remote: https://github.com/jsor/lity
  license:
    name: MIT
    url: https://github.com/jsor/lity/blob/master/LICENSE
    gpl-compatible: true
  css:
    theme:
      /libraries/lity/dist/lity.min.css: { minified: true }
  js:
    /libraries/lity/dist/lity.min.js: { minified: true }
```

### Drupal libraries

You have to manage you compiled CSS and JavaScript files as Drupal libraries.
All libraries are defined in `libraries.yml` file. There is a global library:
we will load that in all pages. But you have to create and attach different
libraries for specified blocks / pages. For example you can create libraries for
sliders, a specific view, a single page or block.

Don't forget to add dependencies for each libraries, and attributes for files
like: `minified`, `external`, `async` and so on.

Further more we don't want to be aggregated these libraries by Drupal, so you
will need to add `{preprocess: false}` too.

Example for them:

```yaml
user-profile:
  js:
    //platform.twitter.com/widgets.js: { type: external, preprocess: false, attributes: { async: true } }
    js/dist/user-profile.js: { minified: true, preprocess: false }
  dependencies:
    - core/jquery
    - core/drupal
```

### Webfonts

All webfonts must be imported properly. If Internet Explorer 11 and below isn't
important and don't want to use special characters you can use Google Fonts as
external css file. (Google Fonts only support `WOFF2` webfont format) Please
use the Drupal library system for that:

```yaml
global-styling:
  css:
    base:
      //fonts.googleapis.com/css?family=Rubik:400,400i,500,700&display=swap&subset=latin-ext: { external: true }
```

Please note here: use `display=swap` for font-display property and
`subset=latin-ext` for extended language support.

In case of Internet Explorer 11 and below is important for you, you can generate
your own webfonts with a service like FontSquirrel into the `/fonts` directory.
Then make them available via `@font-face` rules in a base level Sass file,
for example in `3.base/_base.fonts.scss`:

```scss
@font-face {
  font-family: Rubik;
  src:
    url("/fonts/rubik-medium.woff2") format("woff2"),
    url("/fonts/rubik-medium.woff") format("woff");
  font-weight: 500;
  font-style: normal;
  font-display: swap;
}
```

You may noticed, this font face declaration not placed in settings level. Here
is why: all files in settings and tools level not produced css code, so we can
import them to multiple files without duplicate css code creation.

### CSS Media queries and Breakpoints

We don't provide any grid systems or breakpoint is SASS: you can use whatever
you want. But there is a default `breakpoints.yml` file, where are some
predefined breakpoints for Drupal. You have to keep it in sync with your
actually breakpoints in SASS. (This file is only a placeholder/template file,
for easier start.)

### 3rd Party SASS libraries

If you need some external SASS files to generate your CSS, you can import them
from node_modules via gulp.js. For example if you want use Foundation for Sites
as your breakpoint and grid system, add the following paths to the Sass Gulp
tasks:

```js
function sassDevTask(done) {
  gulp
    [...]
    .pipe(sass({
      [...]
      includePaths: [
        'node_modules/foundation-sites/scss/',
        'node_modules/foundation-sites/_vendor/sassy-lists/stylesheets'
      ]
    }))
    [...];
  done();
}
```

## Coding Standards

### General Rules

First of all, we use Drupal's [.editorconfig](https://github.com/brainsum/static-boilertemplate/blob/master/.editorconfig)
for basic code styling.

All comments in Sass, PHP and JavaScript files must be in [Doxygen](https://www.drupal.org/docs/develop/standards/css/css-formatting-guidelines#comments)
format. See details in our Wiki.

### SASS/CSS Coding Standard

#### SASS/CSS Coding Style

Coding Style is based on [Drupal's CSS Coding Standard](https://www.drupal.org/docs/develop/standards/css).
We must use Doxygen comments, [SMACSS](https://smacss.com/book/categorizing)
architecture and [BEM](http://getbem.com) or [BEMIT](https://csswizardry.com/2015/08/bemit-taking-the-bem-naming-convention-a-step-further/) syntax schemes. In this theme we used [ITCSS](https://www.xfive.co/blog/itcss-scalable-maintainable-css-architecture/)
for structure Sass too as it's working perfectly with SMACSS.

#### SASS/CSS Linting Tools

All rules checked by **[Stylelint](https://stylelint.io)** from Drupal 8's core
(removed all rules that needed only for Drupal projects). There are Stylelint
plugins for all popular IDE/code editor, but also there is linting task in
builder tool too. Some rules can be fixed via CLI, but the most need manual
work (You will get only warning messages.).

Currently there aren't a "perfect" tool, so there are some caveats:

* **stylelint-no-browser-hacks** _Stylelint plugin_ has been removed because it
  has incompatibility issue with Sass variables (originally its developed for
  vanilla CSS, Sass linting is provided only by a plugin).

* **no-unknown-animations** _Stylelint rule_ has been removed because it's not
  support Sass `@mixin`, `@import` rules (they must be same file and same level).

* However **Stylelint** has sorting plugins, they can't make any changes in
  files.

### JavaScript Coding Standard

#### JavaScript Coding Style and Tool

JavaScript coding style based on [Drupal's JavaScript coding standard](https://www.drupal.org/docs/develop/standards/javascript).
For linting we use **[ESlint](https://eslint.org)**. The ESlint config based on
[Drupal's core ESlint config](https://www.drupal.org/docs/develop/standards/javascript/eslint-settings),
witch is based on Airbnb's React ESlint config. Because there isn't any React
and ES6, we removed all rules that related directly to them and switched to
`airbnb-base/legacy` config for ES5 (and below).
