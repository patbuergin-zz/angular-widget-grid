(function () {
  /**
   * @ngdoc service
   * @name widgetGrid.gridUtil
   * 
   * @description
   * Provides utility functions for various library components.
   * 
   * @requires $templateCache
   */
  angular.module('widgetGrid').service('gridUtil', function ($templateCache) {
    var service = {
      getTemplate: getTemplate,
      sortWidgets: sortWidgets
    };

    /**
     * @ngdoc method
     * @name getTemplate
     * @methodOf widgetGrid.gridUtil
     * 
     * @description
     * Tries to retrieve a template from the cache.
     * The cache is populated by `ngtemplates` during build.
     * 
     * @param {string} templateName Cache key
     * @return {string} Markup of the cached template, if any
     */
    function getTemplate(templateName) {
      var template = $templateCache.get(templateName);
      return template ? template : null;
    }


    /**
     * @ngdoc method
     * @name sortWidgets
     * @methodOf widgetGrid.gridUtil
     * 
     * @description
     * Sorts a collection of widgets by position, from top-left to bottom-right.
     * 
     * @param {Widget[]} widgets Widgets
     * @return {Widget[]} Sorted widgets
     */
    function sortWidgets(widgets) {
      var sorted = [];

      if (!widgets.length || widgets.length < 2) {
        return widgets;
      }

      var curr, comp, found;
      for (var i = 0; i < widgets.length; i++) {
        curr = widgets[i];
        
        found = false;
        for (var j = 0; j < sorted.length; j++) {
          comp = sorted[j];
          if (curr.top < comp.top || (curr.top === comp.top && curr.left < comp.left)) {
            sorted.splice(j, 0, curr);
            found = true;
            break;
          }
        }
        if (!found) {
          sorted.push(curr);
        }
      }

      return sorted;
    }

    return service;
  });
})();
