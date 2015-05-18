(function () {
  angular.module('widgetGrid').directive('wgGridPreview', function () {
    return {
      scope: {
        'rendering': '='
      },
      restrict: 'AE',
      replace: true,
      template: '<svg xmlns="http://www.w3.org/2000/svg" class="wg-grid-overlay"></svg>',
      link: function (scope, element) {
        var XMLNS = 'http://www.w3.org/2000/svg';
        
        scope.$watch('rendering', function (newVal) {
          if (newVal) {
            update(newVal);
          }
        });
        
        function update(rendering) {
          element.children().remove();
          
          var cellHeight = rendering.grid.cellSize.height,
              cellWidth = rendering.grid.cellSize.width,
              height = cellHeight + '%',
              width = cellWidth + '%';
          
          for (var i = 0; i < rendering.grid.rows; i++) {
            for (var j = 0; j < rendering.grid.columns; j++) {
              var rect = document.createElementNS(XMLNS, 'rect');
              var x = (j * cellWidth) + '%',
                  y = (i * cellHeight) + '%',
                  fill = 'rgb(224, 224, 224)';
              
              rect.setAttributeNS(null, 'x', x);
              rect.setAttributeNS(null, 'y', y);
              rect.setAttributeNS(null, 'width', width);
              rect.setAttributeNS(null, 'height', height);
              rect.setAttributeNS(null, 'fill', fill);
              rect.setAttributeNS(null, 'stroke', 'rgb(206, 206, 206)');
              rect.setAttributeNS(null, 'stroke-width', '1');
              
              element.append(rect);
            }
          }
        }
      }
    };
  });
})();
