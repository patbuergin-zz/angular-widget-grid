(function () {
  angular.module('widgetGrid').factory('GridRendering', [function () {
    var GridRendering = function GridRendering(grid, renderedPositions) {
      var self = this;
      
      var _grid = grid || { widgets: [] };
      var _renderedPositions = renderedPositions || [];
            
      self.getWidgetAt = function (i, j) {
        for (var idx = 0; idx < _renderedPositions.length; idx++) {
          var pos = _renderedPositions[idx];
          
          if (pos.top <= i && i <= pos.top + pos.height &&
              pos.left <= j && i <= pos.left + pos.width) {
            return _grid.widgets[idx];
          }
        }
        
        return null;
      };
      
      self.isObstructed = function (i, j) {
        return self.getWidgetAt(i, j) !== null;
      };
      
      self.getWidgetStyle = function (idx) {
        var render = _renderedPositions[idx];
        
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