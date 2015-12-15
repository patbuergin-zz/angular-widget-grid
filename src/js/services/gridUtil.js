(function () {
  /**
   * @ngdoc service
   * @name gridUtil
   * 
   * @description
   * Provides utility functions for various library components
   */
  angular.module('widgetGrid').service('gridUtil', function ($templateCache, GridPosition) {
    var service = {
      getTemplate: getTemplate,
      getUID: getUID,
      sortWidgets: sortWidgets,
      findLargestEmptyArea: findLargestEmptyArea,
      computeCellSize: computeCellSize
    };

    /**
     * @ngdoc method
     * @name getTemplate
     * 
     * @description
     * Retrieves templates from the cache
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
     * 
     * @description
     * Returns a unique identifier
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
     * 
     * @description
     * Sorts a collection of widgets by position, from top-left to bottom-right
     * 
     * @param {Widget[]} widgets Unsorted Widgets
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
     * @ngdoc method
     * @name computeCellSize
     * 
     * @description
     * Computes the relative cell size given row and column count
     * 
     * @param {number} rowCount
     * @param {number} columnCount
     * @return {{ height: number, width: number }} Cell size (%)
     */
    function computeCellSize(rowCount, columnCount) {
      return {
        height: rowCount >= 1 ? 100 / rowCount : 0,
        width: columnCount >= 1 ? 100 / columnCount : 0
      };
    }


    /**
     * @ngdoc method
     * @name findLargestEmptyArea
     * 
     * @description
     * Finds the largest non-obstructed area in a given rendering, if any
     * 
     * @param {GridRendering} rendering
     * @return {GridArea} Largest empty area, or null
     */
    function findLargestEmptyArea(rendering) {
      if (!angular.isDefined(rendering) || !angular.isDefined(rendering.grid)) {
        return null;
      }

      var grid = rendering.grid;
      var maxPosition = null, currMaxPosition = null,
          maxArea = 0, currMaxArea = 0;
      for (var i = 1; i <= grid.rows; i++) {
        for (var j = 1; j <= grid.columns; j++) {
          if (rendering._isObstructed(i, j)) {
            continue;
          }

          var currAreaLimit = (grid.rows - i + 1) * (grid.columns - j + 1);
          if (currAreaLimit < maxArea) {
            break;
          }

          currMaxPosition = _findLargestEmptyAreaFrom(new GridPosition(i, j), rendering);
          currMaxArea = currMaxPosition.height * currMaxPosition.width;

          if (currMaxArea > maxArea) {
            maxArea = currMaxArea;
            maxPosition = currMaxPosition;
          }
        }
      }
      return maxPosition;
    }


    /**
     * Finds the largest empty area that starts at a given position
     * 
     * @param {GridPosition} start
     * @return {GridArea} Largest empty area, or null
     */
    function _findLargestEmptyAreaFrom(start, rendering) {
      if (!angular.isDefined(rendering) || !angular.isDefined(rendering.grid) ||
          !angular.isNumber(rendering.grid.columns) || !angular.isNumber(rendering.grid.rows)) {
        return null;
      }

      var maxPosition = null,
          maxArea = 0,
          endColumn = rendering.grid.columns;
      for (var i = start.top; i <= rendering.grid.rows; i++) {
        for (var j = start.left; j <= endColumn; j++) {
          if (rendering._isObstructed(i, j)) {
            endColumn = j - 1;
            continue;
          }

          var currHeight = (i - start.top + 1),
              currWidth = (j - start.left + 1),
              currArea = currHeight * currWidth;

          if (currArea > maxArea) {
            maxArea = currArea;
            maxPosition = {
              top: start.top,
              left: start.left,
              height: currHeight,
              width: currWidth
            };
          }
        }
      }
      return maxPosition;
    }

    return service;
  });
})();
