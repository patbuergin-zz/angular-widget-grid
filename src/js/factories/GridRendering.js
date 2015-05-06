(function () {
  angular.module('widgetGrid').factory('GridRendering', [function () {
    var GridRendering = function GridRendering(grid, positions) {
      var self = this;
      
      var _grid = grid || { widgets: [] };
      self.positions = positions || {};
      
      self.rasterizeCoords = rasterizeCoords;
      
      self.getWidgetIdAt = getWidgetAt;
      self.isObstructed = isObstructed;
    
      function rasterizeCoords(x, y, gridWidth, gridHeight) {
        x = Math.min(Math.max(x, 1), gridWidth);
        y = Math.min(Math.max(y, 1), gridHeight);

        return {
          i: Math.ceil((y / gridHeight) * (_grid.rows)),
          j: Math.ceil((x / gridWidth) * (_grid.columns))
        };
      }
      
      function getWidgetAt(i, j) {
        for (var widgetId in self.positions) {
          var pos = self.positions[widgetId];
          
          if (pos.top <= i && i <= (pos.top + pos.height - 1) &&
              pos.left <= j && j <= (pos.left + pos.width - 1)) {
            return widgetId;
          }
        }

        return null;
      }
    
      function isObstructed(i, j) {
        if (i < 1 || j < 1 || j > _grid.columns) {
          return true;
        }
        return self.getWidgetIdAt(i, j) !== null;
      }
      
      self.getStyle = function (widgetId) {
        var render = self.positions[widgetId];
        
        if (!render) {
          return { display: 'none' };
        }
        
        return {
          top: ((render.top - 1) * _grid.cellSize.height).toString() + '%',
          height: (render.height * _grid.cellSize.height).toString() + '%',
          left: ((render.left - 1) * _grid.cellSize.width).toString() + '%',
          width: (render.width * _grid.cellSize.width).toString() + '%'
        };
      };
    };
    
    return GridRendering;
  }]);
})();
