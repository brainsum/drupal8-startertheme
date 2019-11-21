# BRAINSUM's Drupal 8 startertheme

* Created by: [Krisztian Pinter](kpinter@brainsum.com)
* Created in: 2019.
* Updated on: 2019.11.21.

## Table of Contents

* About
* Installation
* Usage
* Structure
* Coding Standards

## About

Drupal 8 startertheme based on core's Classy base theme. Build process powered
by [Gulp.js 4](https://gulpjs.com/docs/en/getting-started/quick-start) and asset
files (sass, css, js) structured, linted and compiled according to Drupal Coding
Standards. You can equally run build processes by gulp commands or npm scripts.

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
gulp, like `gulp sassDev` or with package.json's scripts: `npm start` or
`npm run start`. In both you can choose from the following tasks:

```bash
start # run development version sass, scripts then watch and BrowserSync
prod # run production version sass and scripts. You must run it before commit
sassDev # run development version sass; no watch, BrowserSync in this way
sassProd # run production version sass
sassLint # Linting sass files
scripts # run scripts task; no watch, BrowserSync in this way
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
* `vendors` directory: all production needed vendor libraries used from here

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

### JavaScripts structure

Our all JavaScript files will go to `js` directory. We work from `src` directory
and place the compiled js files to `dist` directory.

### Vendor libraries

Because we don't use ES6 features, js bundlers, if you need a third party
css/sass/js library and you want use it as library (instead of merging it into
your src files): install it with npm to `node_modules`, then just run the
`copyVendorsTask` from gulp.js. (It's part of `default`/`start` and `prod` tasks
too.) It will search dist version of the library and copy it into `vendors`
directory.
For example __Glide JS__ library added to `dependencies` and run
`vendors` task. As you can see only the needed files have been copied from
`node_modules` to `vendors` directory. However this is just for demonstration
purposes, you can remove it if you don't want to use.

### Drupal libraries

You have to manage you compiled CSS and JavaScript files as Drupal libraries.
All libraries are defined in `libraries.yml` file. There is a global library:
we will load that in all pages. But you have to create and attach different
libraries for specified blocks / pages. For example you can create libraries for
sliders, a specific view, a single page or block.

Don't forget to add dependencies for each libraries, and attributes for files
like: `minified`, `external`, `async` and so on.

Furthere more we don't want to be aggregated these libraries by Drupal, so you
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

_Another tool_: **[CSSComb](http://csscomb.com/)**. However it's an almost dead
project (only maintained, but no any new features in the future), only a few
(12) rules supported (Stylelint has more than 160 + plugins), but it can autofix
everything and sorting CSS rules.
Recommended to run it manually before commit a Sass file. Use the `.csscomb.json`
with IDE/code editor plugins. CSSComb config based on Drupal's [CSSCombx](https://github.com/drugan/csscombx) config, but updated to latest version and added new
css properties.

Currently there aren't a "perfect" tool, so there are some caveats:

* **stylelint-no-browser-hacks** _Stylelint plugin_ has been removed because it
  has incompatibility issue with Sass variables (originally its developed for
  vanilla CSS, Sass linting is provided only by a plugin).

* **no-unknown-animations** _Stylelint rule_ has been removed because it's not
  support Sass `@mixin`, `@import` rules (they must be same file and same level).

* **CSSComb** doesn't support multiline property values (after it we need
  realign them).

* **CSSComb** could fail when a file started with comment blocks (temporary need
  to remove them, then paste back).

* However **Stylelint** has sorting plugins, they can't make any changes in
  files, only warning us for about wrong order, so we need still use CSSComb for
  that. (Run CSSComb on a file then fix reported issues by Stylelint.)

* There are some new/edge css properties what **CCSComb** currently doesn't
  support, You must add them to `.csscomb.json` and rerun CSSComb, otherwise
  there will be an empty newline, what will be cause an error/warning in
  Stylelint (and css coding standard).

### JavaScript Coding Standard

#### JavaScript Coding Style and Tool

JavaScript coding style based on [Drupal's JavaScript coding standard](https://www.drupal.org/docs/develop/standards/javascript).
For linting we use **[ESlint](https://eslint.org)**. The ESlint config based on
[Drupal's core ESlint config](https://www.drupal.org/docs/develop/standards/javascript/eslint-settings),
witch is based on Airbnb's React ESlint config. Because there isn't any React
and ES6, we removed all rules that related directly to them and switched to
`airbnb-base/legacy` config for ES5 (and below).
