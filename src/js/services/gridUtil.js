(function () {
  angular.module('widgetGrid').service('gridUtil', ['$templateCache', function ($templateCache) {
    var service = {
      getUID: getUID,
      sortWidgets: sortWidgets,
      findLargestEmptyArea: findLargestEmptyArea,
      roundDecimal: roundDecimal,
      computeCellSize: computeCellSize,
      getTemplate: getTemplate,
      getPathIterator: getPathIterator
    };

    var nextId = 1;
    function getUID() {
      return (nextId++).toString();
    }


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


    function roundDecimal(decimal) {
      return Math.round(decimal * 10000) / 10000;
    }


    function computeCellSize(rowCount, columnCount) {
      return {
        height: rowCount >= 1 ? this.roundDecimal(100 / rowCount) : 0,
        width: columnCount >= 1 ? this.roundDecimal(100 / columnCount) : 0
      };
    }


    function getTemplate(templateName) {
      var template = $templateCache.get(templateName);
      return template ? template : null;
    }


    function getPathIterator(endPos, startPos) {
      var topDelta = endPos.top - startPos.top;
      var leftDelta = endPos.left - startPos.left;        
      var steps = Math.max(Math.abs(topDelta), Math.abs(leftDelta));
      var currStep = 0;
      var currPos = null;
      var nextPos = { top: startPos.top, left: startPos.left };

      return {
        hasNext: function () {
          return nextPos !== null;
        },
        next: function () {
          currPos = nextPos;
          
          if (currStep < steps) {
            currStep++;              
            var currTopDelta = Math.round((currStep/steps) * topDelta);
            var currLeftDelta = Math.round((currStep/steps) * leftDelta);
            nextPos = {
              top: startPos.top + currTopDelta,
              left: startPos.left + currLeftDelta
            };
          } else {
            nextPos = null;
          }

          return currPos;
        }
      };
    }


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

          currMaxPosition = findLargestEmptyAreaFrom(i, j, rendering);
          currMaxArea = currMaxPosition.height * currMaxPosition.width;

          if (currMaxArea > maxArea) {
            maxArea = currMaxArea;
            maxPosition = currMaxPosition;
          }
        }
      }
      return maxPosition;
    }


    function findLargestEmptyAreaFrom(row, column, rendering) {
      if (!angular.isDefined(rendering) || !angular.isDefined(rendering.grid) ||
          !angular.isNumber(rendering.grid.columns) || !angular.isNumber(rendering.grid.rows)) {
        return null;
      }

      var maxPosition = null,
          maxArea = 0,
          endColumn = rendering.grid.columns;
      for (var i = row; i <= rendering.grid.rows; i++) {
        for (var j = column; j <= endColumn; j++) {
          if (rendering._isObstructed(i, j)) {
            endColumn = j - 1;
            continue;
          }

          var currHeight = (i - row + 1),
              currWidth = (j - column + 1),
              currArea = currHeight * currWidth;

          if (currArea > maxArea) {
            maxArea = currArea;
            maxPosition = {
              top: row,
              left: column,
              height: currHeight,
              width: currWidth
            };
          }
        }
      }
      return maxPosition;
    }

    return service;
  }]);
})();
