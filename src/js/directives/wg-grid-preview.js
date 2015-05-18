(function () {
  angular.module('widgetGrid').directive('wgGridPreview', function () {
    return {
      scope: {
        'rendering': '=',
        'highlight': '=?'
      },
      restrict: 'AE',
      replace: true,
      template: '<svg xmlns="http://www.w3.org/2000/svg" class="wg-grid-overlay"></svg>',
      link: function (scope, element) {
        var XMLNS = 'http://www.w3.org/2000/svg',
            COLOR_DEFAULT = 'rgb(234, 234, 234)',
            COLOR_HIGHLIGHT = 'rgba(0, 113, 188, 0.25)',
            COLOR_STROKE = 'rgba(255, 255, 255, 1)';
        var highlightedCells = [];
        
        scope.$watch('rendering', function (newVal) {
          if (newVal) {
            update(newVal);
          }
        });
        
        scope.$watch('highlight', function (newVal, oldVal) {
          if (!angular.equals(newVal, oldVal)) {
            if (highlightedCells.length > 0) {
              resetHighlights(highlightedCells);
            }
            if (newVal) {
              highlightArea(scope.rendering, newVal);
            }
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
                  y = (i * cellHeight) + '%';
              
              rect.setAttributeNS(null, 'x', x);
              rect.setAttributeNS(null, 'y', y);
              rect.setAttributeNS(null, 'width', width);
              rect.setAttributeNS(null, 'height', height);
              rect.setAttributeNS(null, 'fill', COLOR_DEFAULT);
              rect.setAttributeNS(null, 'stroke', COLOR_STROKE);
              rect.setAttributeNS(null, 'stroke-width', '1');
              
              element.append(rect);
            }
          }
        }
        
        function resetHighlights(highlightedCells) {
          var cells = element.children();
          for (var idx = 0; idx < highlightedCells.length; idx++) {
            var cell = cells[highlightedCells[idx]];
            cell.setAttribute('fill', COLOR_DEFAULT);
          }
          highlightedCells = [];
        }
        
        function highlightArea(rendering, area) {
          var cells = element.children();
          var top = Math.max(area.top, 1),
              bottom = Math.min(top + area.height - 1, rendering.grid.rows),
              left = Math.max(area.left, 1),
              right = Math.min(area.left + area.width - 1, rendering.grid.columns);
          
          for (var i = top; i <= bottom; i++) {
            for (var j = left; j <= right; j++) {
              var idx = (i-1) * rendering.grid.columns + (j-1);
              var cell = cells[idx];
              cell.setAttribute('fill', COLOR_HIGHLIGHT);
              highlightedCells.push(idx);
            }
          }
        }
      }
    };
  });
})();
