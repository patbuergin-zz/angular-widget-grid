(function () {
  /**
   * @ngdoc service
   * @name widgetGrid.gridUtil
   * 
   * @description
   * Provides utility functions for various library components.
   * 
   * @requires $templateCache
   * @requires widgetGrid.CellSize
   * @requires widgetGrid.GridArea
   * @requires widgetGrid.GridPoint
   */
  angular.module('widgetGrid').service('gridUtil', function ($templateCache, GridArea, GridPoint) {
    var service = {
      findLargestEmptyArea: findLargestEmptyArea,
      getTemplate: getTemplate,
      getUID: getUID,
      sortWidgets: sortWidgets
    };

    /**
     * @ngdoc method
     * @name findLargestEmptyArea
     * @methodOf widgetGrid.gridUtil
     * 
     * @description
     * Finds the largest non-obstructed area in a given rendering, if any.
     * 
     * @param {GridRendering} rendering Rendering
     * @return {GridArea} Largest empty area, or null
     */
    function findLargestEmptyArea(rendering) {
      if (!angular.isDefined(rendering) || !angular.isDefined(rendering.grid)) {
        return null;
      }

      var grid = rendering.grid;
      var maxArea = null, currMaxArea = null,
          maxSurfaceArea = 0, currMaxSurfaceArea = 0;
      for (var i = 1; i <= grid.rows; i++) {
        for (var j = 1; j <= grid.columns; j++) {
          if (rendering._isObstructed(i, j)) {
            continue;
          }

          var currAreaLimit = (grid.rows - i + 1) * (grid.columns - j + 1);
          if (currAreaLimit < maxSurfaceArea) {
            break;
          }

          currMaxArea = _findLargestEmptyAreaFrom(new GridPoint(i, j), rendering);
          currMaxSurfaceArea = currMaxArea.getSurfaceArea();

          if (currMaxSurfaceArea > maxSurfaceArea) {
            maxSurfaceArea = currMaxSurfaceArea;
            maxArea = currMaxArea;
          }
        }
      }
      return maxArea;
    }


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
     * @name getUID
     * @methodOf widgetGrid.gridUtil
     * 
     * @description
     * Returns a unique identifier.
     * 
     * @return {number} Unique identifier
     */
    var nextId = 1;
    function getUID() {
      return (nextId++).toString();
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


    /**
     * Finds the largest empty area that starts at a given position.
     * 
     * @param {GridPoint} start Start position
     * @return {GridArea} Largest empty area, or null
     */
    function _findLargestEmptyAreaFrom(start, rendering) {
      if (!angular.isDefined(rendering) || !angular.isDefined(rendering.grid) ||
          !angular.isNumber(rendering.grid.columns) || !angular.isNumber(rendering.grid.rows)) {
        return null;
      }

      var maxArea = null,
          maxSurfaceArea = 0,
          endColumn = rendering.grid.columns;
      for (var i = start.top; i <= rendering.grid.rows; i++) {
        for (var j = start.left; j <= endColumn; j++) {
          if (rendering._isObstructed(i, j)) {
            endColumn = j - 1;
            continue;
          }

          var currHeight = (i - start.top + 1),
              currWidth = (j - start.left + 1),
              currSurfaceArea = currHeight * currWidth;

          if (currSurfaceArea > maxSurfaceArea) {
            maxSurfaceArea = currSurfaceArea;
            maxArea = new GridArea(start.top, start.left, currHeight, currWidth);
          }
        }
      }
      return maxArea;
    }

    return service;
  });
})();
