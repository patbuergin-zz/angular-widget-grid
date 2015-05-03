(function () {
  angular.module('widgetGrid').factory('GridRendering', [function () {
    var GridRendering = function GridRendering(grid, positions) {
      var self = this;
      
      var _grid = grid || { widgets: [] };
      self.positions = positions || {};
            
      self.getWidgetAt = function (i, j) {
        for (var idx = 0; idx < self.positions.length; idx++) {
          var pos = self.positions[idx];
          
          if (pos.top <= i && i <= (pos.top + pos.height - 1) &&
              pos.left <= j && i <= (pos.left + pos.width - 1)) {
            return _grid.widgets[idx];
          }
        }
        return null;
      };
      
      self.isObstructed = function (i, j) {
        if (i < 0 || j < 0 || i >= _grid.cellSize.height || j >= _grid.cellSize.width) {
          return true;
        }
        return self.getWidgetAt(i, j) !== null;
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
        }
      };
    };
    
    return GridRendering;
  }]);
})();