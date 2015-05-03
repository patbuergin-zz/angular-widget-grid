(function () {
  angular.module('widgetGrid').service('gridRenderer', ['GridRendering', function (GridRendering) {
    return {
      render: function (grid) {
        // TODO
        
        var renderedPositions = [];
        
        return new GridRendering(grid, renderedPositions);
      }
    };
  }]);
})();