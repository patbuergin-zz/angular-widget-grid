(function () {
  angular.module('widgetGrid').factory('GridRendering', [function () {
    var GridRendering = function GridRendering(grid, positions) {
      var self = this;
      
      var _grid = grid || { widgets: [] };
      self.positions = positions || {};
            
      self.getWidgetIdAt = function (i, j) {
        for (var widgetId in self.positions) {
          var pos = self.positions[widgetId];
          
          if (pos.top <= i && i <= (pos.top + pos.height - 1) &&
              pos.left <= j && j <= (pos.left + pos.width - 1)) {
            return widgetId;
          }
        }

        return null;
      };
      
      self.isObstructed = function (i, j) {
        if (i < 0 || j < 0 || j >= _grid.columns) {
          return true;
        }
        return self.getWidgetIdAt(i, j) !== null;
      };
      
      self.getStyle = function (widgetId) {
        var render = self.positions[widgetId];
        
        if (!render) {
          return { display: 'none' };
        }
        
        return {
          top: (render.top * _grid.cellSize.height).toString() + '%',
          height: (render.height * _grid.cellSize.height).toString() + '%',
          left: (render.left * _grid.cellSize.width).toString() + '%',
          width: (render.width * _grid.cellSize.width).toString() + '%'
        };
      };
    };
    
    return GridRendering;
  }]);
})();
