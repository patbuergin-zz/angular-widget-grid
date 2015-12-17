(function () {
  /**
   * @ngdoc object
   * @name widgetGrid.GridRendering
   * 
   * @description
   * A rendering of a grid, assigning positions to each of its widgets,
   * keeping track of obstructions, and providing utility functions.
   * 
   * @requires widgetGrid.GridArea
   * @requires widgetGrid.GridPoint
   */
  angular.module('widgetGrid').factory('GridRendering', function (GridArea, GridPoint) {
    /**
     * @ngdoc method
     * @name GridRendering
     * @methodOf widgetGrid.GridRendering
     * 
     * @description
     * Constructor.
     * 
     * @param {Grid} grid Rendered grid
     */
    var GridRendering = function GridRendering(grid) {
      this.grid = grid || { rows: 0, columns: 0 };
      this.positions = {};
      this.cachedNextPosition = undefined;
      this.obstructions = [];
      for (var i = 0; i < this.grid.rows * this.grid.columns; i++) {
          this.obstructions[i] = 0;
      }
    };


    /**
     * @ngdoc method
     * @name rasterizeCoords
     * @methodOf widgetGrid.GridRendering
     * 
     * @description
     * Returns grid coordinates for a set of pixel coordinates.
     * 
     * @param {number} top Top position (px)
     * @param {number} left Left position (px)
     * @param {number} gridWidth Width of the grid container (px)
     * @param {number} gridHeight Height of the grid container (px)
     * @return {GridPoint} Corresponding point on the grid
     */
    GridRendering.prototype.rasterizeCoords = function (top, left, gridWidth, gridHeight) {
      top = Math.min(Math.max(top, 0), gridWidth - 1);
      left = Math.min(Math.max(left, 0), gridHeight - 1);

      var i = Math.floor(left / gridHeight * this.grid.rows) + 1,
          j = Math.floor(top / gridWidth * this.grid.columns) + 1;
      return new GridPoint(i, j);
    };


    /**
     * @ngdoc method
     * @name getWidgetIdAt
     * @methodOf widgetGrid.GridRendering
     * 
     * @description
     * Gets the id of the widget at a given grid position, if any.
     * 
     * @param {number} i Top position
     * @param {number} j Left position
     */
    GridRendering.prototype.getWidgetIdAt = function (i, j) {
      for (var widgetId in this.positions) {
        var position = this.positions[widgetId];

        if (position.top <= i && i <= (position.top + position.height - 1) &&
            position.left <= j && j <= (position.left + position.width - 1)) {
          return widgetId;
        }
      }
      return null;
    };


    /**
     * @ngdoc method
     * @name getWidgetPosition
     * @methodOf widgetGrid.GridRendering
     * 
     * @description
     * Gets the rendered position of a given widget.
     * 
     * @param {string} widgetId Id of the widget
     * @return {GridArea} Rendered position
     */
    GridRendering.prototype.getWidgetPosition = function (widgetId) {
      return this.positions[widgetId];
    };


    /**
     * @ngdoc method
     * @name setWidgetPosition
     * @methodOf widgetGrid.GridRendering
     * 
     * @description
     * Sets the rendered position for a given widget.
     * 
     * @param {string} widgetId Id of the widget
     * @param {GridArea} newPosition Rendered position
     */
    GridRendering.prototype.setWidgetPosition = function (widgetId, newPosition) {
      var currPosition = this.positions[widgetId];
      if (currPosition) {
        this.setObstructionValues(currPosition, 0);
      }

      newPosition = {
        top: angular.isNumber(newPosition.top) ? newPosition.top : currPosition.top,
        left: angular.isNumber(newPosition.left) ? newPosition.left : currPosition.left,
        height: angular.isNumber(newPosition.height) ? newPosition.height : currPosition.height,
        width: angular.isNumber(newPosition.width) ? newPosition.width : currPosition.width
      };
      this.positions[widgetId] = newPosition;

      this.setObstructionValues(this.positions[widgetId], 1);
      this.cachedNextPosition = undefined;
    };


    /**
     * @ngdoc method
     * @name hasSpaceLeft
     * @methodOf widgetGrid.GridRendering
     * 
     * @description
     * Whether any cell in the grid is unoccupied.
     * 
     * @return {boolean} Has space left
     */
    GridRendering.prototype.hasSpaceLeft = function () {
      for (var i = 0; i < this.obstructions.length; i++) {
        if (!this.obstructions[i]) {
          return true;
        }
      }
      return false;
    };


    /**
     * @ngdoc method
     * @name getNextPosition
     * @methodOf widgetGrid.GridRendering
     * 
     * @description
     * Gets the next best unoccupied area in the current rendering, if any.
     * Can e.g. be used to determine positions for newly added widgets.
     * 
     * @return {GridPosition} Next position, or null
     */
    GridRendering.prototype.getNextPosition = function () {
      if (angular.isDefined(this.cachedNextPosition)) {
        return this.cachedNextPosition; 
      }

      if (!this.hasSpaceLeft()) {
        return null;
      }

      var maxPosition = this.findLargestEmptyArea(this);
      this.cachedNextPosition = maxPosition;
      return maxPosition;
    };


    /**
     * @ngdoc method
     * @name isObstructed
     * @methodOf widgetGrid.GridRendering
     * 
     * @description
     * Checks whether a given point in the grid is obstructed by a widget,
     * considering the current grid's bounds, as well as an optional excluded area.
     * 
     * @param {number} i Top position
     * @param {number} j Left position
     * @param {GridArea} excludedArea Area to ignore (optional)
     * @return {boolean} Whether it is obstructed
     */
    GridRendering.prototype.isObstructed = function (i, j, excludedArea) {
      // obstructed if (i, j) exceeds the grid's regular non-expanding boundaries
      if (i < 1 || j < 1 || j > this.grid.columns || i > this.grid.rows) {
        return true;
      }

      // pass if (i, j) is within the excluded area, if any
      if (excludedArea &&
          excludedArea.top <= i &&
          i <= excludedArea.bottom &&
          excludedArea.left <= j &&
          j <= excludedArea.right) {
        return false;
      }

      return this._isObstructed(i, j);
    };


    /**
     * @ngdoc method
     * @name _isObstructed
     * @methodOf widgetGrid.GridRendering
     * 
     * @description
     * Checks whether a given point in the grid is obstructed by a widget.
     * 
     * @param {number} i Top position
     * @param {number} j Left position
     * @return {boolean} Whether it is obstructed
     */
    GridRendering.prototype._isObstructed = function (i, j) {
      return this.obstructions[(i-1) * this.grid.columns + (j-1)] === 1;
    };


    /**
     * @ngdoc method
     * @name isAreaObstructed
     * @methodOf widgetGrid.GridRendering
     * 
     * @description
     * Checks whether a given area in the grid is obstructed by a widget.
     * 
     * @param {GridArea} area Area
     * @param {Map<string, any>} options Options: `fromBottom` (start search from bottom), `fromRight` (.. from right), `excludedArea` (area to ignore).
     * @return {boolean} Whether it is obstructed
     */
    GridRendering.prototype.isAreaObstructed = function (area, options) {
      if (!area) { return false; }
      options = angular.isObject(options) ? options : {};

      var top = area.top,
          left = area.left,
          bottom = area.bottom || area.top + area.height - 1,
          right = area.right || area.left + area.width - 1;
      
      if (!angular.isNumber(top) || !angular.isNumber(left) ||
          !angular.isNumber(bottom) || !angular.isNumber(right)) {
        return false;
      }

      var verticalStart = options.fromBottom ? bottom : top,
          verticalStep = options.fromBottom ? -1 : 1,
          verticalEnd = (options.fromBottom ? top : bottom) + verticalStep;
      var horizontalStart = options.fromRight ? right : left,
          horizontalStep = options.fromRight ? -1 : 1,
          horizontalEnd = (options.fromRight ? left: right) + horizontalStep;

      for (var i = verticalStart; i !== verticalEnd; i += verticalStep) {
        for (var j = horizontalStart; j !== horizontalEnd; j += horizontalStep) {
          if (this.isObstructed(i, j, options.excludedArea)) {
            return true;
          }
        }
      }
      return false;
    };


    /**
     * @ngdoc method
     * @name getStyle
     * @methodOf widgetGrid.GridRendering
     * 
     * @description
     * Gets the CSS rules for a given widget.
     * 
     * @param {string} widgetId Id of the widget
     * @return {Map<string, string>} CSS rules
     */
    GridRendering.prototype.getStyle = function (widgetId) {
      widgetId = widgetId.id || widgetId;
      var render = this.positions[widgetId];

      if (!render) {
        return { 'display': 'none' };
      }

      return {
        'top': ((render.top - 1) * this.grid.cellSize.height).toString() + '%',
        'height': (render.height * this.grid.cellSize.height).toString() + '%',
        'left': ((render.left - 1) * this.grid.cellSize.width).toString() + '%',
        'width': (render.width * this.grid.cellSize.width).toString() + '%'
      };
    };


    /**
     * @ngdoc method
     * @name setObstructionValues
     * @methodOf widgetGrid.GridRendering
     * 
     * @description
     * Sets the obstruction state of an area to a given value. 
     * 
     * @param {GridArea} area Affected area
     * @param {number} value New obstruction value
     */
    GridRendering.prototype.setObstructionValues = function (area, value) {
      for (var i = area.top - 1; i < area.top + area.height - 1; i++) {
        for (var j = area.left - 1; j < area.left + area.width - 1; j++) {
          this.obstructions[i * this.grid.columns + j] = value;
        }
      }
    };


    /**
     * @ngdoc method
     * @name printObstructions
     * @methodOf widgetGrid.GridRendering
     * 
     * @description
     * Prints the current obstruction state of a rendering to the console.
     */
    GridRendering.prototype.printObstructions = function () {
      var row = 'obstructions:';
      for (var i = 0; i < this.grid.columns * this.grid.rows; i++) {
        if (i % this.grid.columns === 0) {
          console.log(row);
          row = '';
        }
        row += this.obstructions[i] + ' ';
      }
      console.log(row);
    };


    /**
     * @ngdoc method
     * @name findLargestEmptyArea
     * @methodOf widgetGrid.GridRendering
     * 
     * @description
     * Finds the largest non-obstructed area in a given rendering, if any.
     * 
     * @return {GridArea} Largest empty area, or null
     */
    GridRendering.prototype.findLargestEmptyArea = function () {
      var maxArea = null, currMaxArea = null,
          maxSurfaceArea = 0, currMaxSurfaceArea = 0;
      for (var i = 1; i <= this.grid.rows; i++) {
        for (var j = 1; j <= this.grid.columns; j++) {
          if (this._isObstructed(i, j)) {
            continue;
          }

          var currAreaLimit = (this.grid.rows - i + 1) * (this.grid.columns - j + 1);
          if (currAreaLimit < maxSurfaceArea) {
            break;
          }

          currMaxArea = _findLargestEmptyAreaFrom(new GridPoint(i, j), this);
          currMaxSurfaceArea = currMaxArea.getSurfaceArea();

          if (currMaxSurfaceArea > maxSurfaceArea) {
            maxSurfaceArea = currMaxSurfaceArea;
            maxArea = currMaxArea;
          }
        }
      }
      return maxArea;
    };


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

    return GridRendering;
  });
})();
