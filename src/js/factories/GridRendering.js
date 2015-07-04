(function () {
  angular.module('widgetGrid').factory('GridRendering', [function () {
    var GridRendering = function GridRendering(grid, positions) {
      this.grid = grid || { widgets: [] };
      this.positions = positions || {};
    };
    
    GridRendering.prototype.rasterizeCoords = function (x, y, gridWidth, gridHeight) {
      x = Math.min(Math.max(x, 0), gridWidth - 1);
      y = Math.min(Math.max(y, 0), gridHeight - 1);
      
      return {
        i: Math.floor(y / gridHeight * this.grid.rows) + 1,
        j: Math.floor(x / gridWidth * this.grid.columns) + 1
      };
    };
    
    GridRendering.prototype.getWidgetIdAt = function (i, j) {
      for (var widgetId in this.positions) {
        var pos = this.positions[widgetId];

        if (pos.top <= i && i <= (pos.top + pos.height - 1) &&
            pos.left <= j && j <= (pos.left + pos.width - 1)) {
          return widgetId;
        }
      }
      return null;
    };
    
    GridRendering.prototype.updateWidget = function (widget) {
      var position = this.positions[widget.id];
      position.top = widget.top || position.top;
      position.left = widget.left || position.left;
      position.height = widget.height || position.height;
      position.width = widget.width || position.width;
    };
  
    // options: excludedArea, expanding
    GridRendering.prototype.isObstructed = function (i, j, options) {
      options = angular.isObject(options) ? options : {};
      
      // obstructed if (i, j) exceeds the grid's regular non-expanding boundaries
      if (i < 1 || j < 1 || j > this.grid.columns) {
        return true;
      }
      
      if (!options.expanding && i > this.grid.rows) {
        return true;
      }
      
      // pass if (i, j) is within the excluded area, if any
      if (options.excludedArea &&
          options.excludedArea.top <= i && i <= options.excludedArea.bottom &&
          options.excludedArea.left <= j && j <= options.excludedArea.right) {
        return false;
      }
      return this.getWidgetIdAt(i, j) !== null;
    };
    
    // options: excludedArea, fromBottom, fromRight, expanding
    GridRendering.prototype.isAreaObstructed = function (area, options) {
      options = angular.isObject(options) ? options : {};
      
      var top = area.top,
          left = area.left,
          bottom = area.bottom || area.top + area.height - 1,
          right = area.right || area.left + area.width - 1;
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
        return { display: 'none' };
      }
      
      return {
        top: ((render.top - 1) * this.grid.cellSize.height).toString() + '%',
        height: (render.height * this.grid.cellSize.height).toString() + '%',
        left: ((render.left - 1) * this.grid.cellSize.width).toString() + '%',
        width: (render.width * this.grid.cellSize.width).toString() + '%'
      };
    };
    
    return GridRendering;
  }]);
})();
