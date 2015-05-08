(function () {
  angular.module('widgetGrid').factory('GridRendering', [function () {
    var GridRendering = function GridRendering(grid, positions) {
      this.grid = grid || { widgets: [] };
      this.positions = positions || {};
    };
    
    GridRendering.prototype.rasterizeCoords = function (x, y, gridWidth, gridHeight) {
      x = Math.min(Math.max(x, 1), gridWidth);
      y = Math.min(Math.max(y, 1), gridHeight);

      return {
        i: Math.ceil((y / gridHeight) * (this.grid.rows)),
        j: Math.ceil((x / gridWidth) * (this.grid.columns))
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
  
    GridRendering.prototype.isObstructed = function (i, j) {
      if (i < 1 || j < 1 || j > this.grid.columns) {
        return true;
      }
      return this.getWidgetIdAt(i, j) !== null;
    };
    
    GridRendering.prototype.getStyle = function (widgetId) {
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
