/**
 * @file
 * Attaches behaviors for startertheme.
 *
 * Please use `context` parameter and/or .one() Drupal's jQuery function if
 * you don't want to run a behavior on each page reload.
 *
 * @see https://www.lullabot.com/articles/understanding-javascript-behaviors-in-drupal
 *
 * @example <caption>Example for context usage</caption>
 *   Drupal.behaviors.starterthemeEntries = {
 *     attach: function entriesFunction(context) {
 *       // get Read more links for entries
 *       var $readMoreLink = $('.entry .read-more', context)
 *         .find('a')
 *         .addClass('read-more__link');
 *   };
 *
 * @example <caption>Example for .once() usage</caption>
 *   var buildDropdownArrow = function buildDropdownArrowFunction() {
 *     selector.menuNav
 *       .find('.menu-item--expanded')
 *       .once('buildDropdownArrowFunction')
 *       .each(function dropdownInsert() {
 *         $(this).append('<span class="dropdown-arrow"><i class="fas fa-angle-right"></i></span>');
 *     });
 *   };
 *
 * IMPORTANT! If you use jQuery, Drupal behaviors or `.once()` function,
 * don't forget to add them to Drupal library as dependencies:
 *
 * @example
 *   global-styling:
 *     ...
 *     dependencies:
 *       - core/jquery
 *       - core/jquery.once
 *       - core/drupal
 */

'use strict';

(function drupalJs($) {
  Drupal.behaviors.astarterthemeThemeFunction = {
    attach: function () {}
  };
})(jQuery);
