(function () {
  angular.module('widgetGrid').factory('GridRendering', function (gridUtil, GridPoint) {
    var GridRendering = function GridRendering(grid) {
      this.grid = grid || { rows: 0, columns: 0 };
      this.positions = {};
      this.cachedNextPosition = undefined;
      this.obstructions = [];
      for (var i = 0; i < this.grid.rows * this.grid.columns; i++) {
          this.obstructions[i] = 0;
      }
    };


    GridRendering.prototype.rasterizeCoords = function (x, y, gridWidth, gridHeight) {
      x = Math.min(Math.max(x, 0), gridWidth - 1);
      y = Math.min(Math.max(y, 0), gridHeight - 1);

      var i = Math.floor(y / gridHeight * this.grid.rows) + 1,
          j = Math.floor(x / gridWidth * this.grid.columns) + 1;
      return new GridPoint(i, j);
    };


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


    GridRendering.prototype.getWidgetPosition = function (widgetId) {
      return this.positions[widgetId];
    };


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


    GridRendering.prototype.hasSpaceLeft = function () {
      for (var i = 0; i < this.obstructions.length; i++) {
        if (!this.obstructions[i]) {
          return true;
        }
      }
      return false;
    };


    GridRendering.prototype.getNextPosition = function () {
      if (angular.isDefined(this.cachedNextPosition)) {
        return this.cachedNextPosition; 
      }

      if (!this.hasSpaceLeft()) {
        return null;
      }

      var maxPosition = gridUtil.findLargestEmptyArea(this);
      this.cachedNextPosition = maxPosition;
      return maxPosition;
    };


    // options: excludedArea, expanding
    GridRendering.prototype.isObstructed = function (i, j, options) {
      options = angular.isObject(options) ? options : {};

      // obstructed if (i, j) exceeds the grid's regular non-expanding boundaries
      if (i < 1 || j < 1 || j > this.grid.columns || (!options.expanding && i > this.grid.rows)) {
        return true;
      }

      // pass if (i, j) is within the excluded area, if any
      if (options.excludedArea &&
          options.excludedArea.top <= i && i <= options.excludedArea.bottom &&
          options.excludedArea.left <= j && j <= options.excludedArea.right) {
        return false;
      }

      return this._isObstructed(i, j);
    };


    // unsafe; w/o bounding box & excluded area
    GridRendering.prototype._isObstructed = function (i, j) {
      return this.obstructions[(i-1) * this.grid.columns + (j-1)] === 1;
    };


    // options: excludedArea, fromBottom, fromRight, expanding
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
          if (this.isObstructed(i, j, options)) {
            return true;
          }
        }
      }
      return false;
    };


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


    GridRendering.prototype.setObstructionValues = function (area, value) {
      // positions are 1-indexed (like matrices)
      for (var i = area.top - 1; i < area.top + area.height - 1; i++) {
        for (var j = area.left - 1; j < area.left + area.width - 1; j++) {
          this.obstructions[i * this.grid.columns + j] = value;
        }
      }
    };


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

    return GridRendering;
  });
})();
