(function () {
  angular.module('widgetGrid').directive('wgGridPreview', function () {
    return {
      scope: {
        'rendering': '=',
        'highlight': '=?'
      },
      restrict: 'AE',
      replace: true,
      template: '<div class="wg-grid-overlay"></div>',
      link: function (scope, element) {
        var highlights = [];
        
        scope.$watch('rendering', function (newVal) {
          if (newVal) {
            update(newVal);
          }
        });
        
        scope.$watch('highlight', function (newVal, oldVal) {
          if (!angular.equals(newVal, oldVal)) {
            if (highlights.length > 0) {
              resetHighlights();
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
          
          // use an interlaced approach to reduce the number of dom elements
          var i, x, y, bar;
          for (i = 1; i < rendering.grid.rows; i += 2) {
              y = (i * cellHeight) + '%';
              bar = '<div class="wg-preview-item wg-preview-row" style="top: ' + y + '; height: calc(' + height + ' - 1px);"></div>';
              element.append(bar);
          }
          
          for (i = 1; i < rendering.grid.columns; i += 2) {
              x = (i * cellWidth) + '%';
              bar = '<div class="wg-preview-item wg-preview-column" style="left: ' + x + '; width: calc(' + width + ' - 1px);"></div>';
              element.append(bar);
          }
        }
        
        function resetHighlights() {
          for (var i = 0; i < highlights.length; i++) {
            highlights[i].remove();
            
          }
          highlights = [];
        }
        
        function highlightArea(rendering, area) {
          var cellHeight = rendering.grid.cellSize.height,
              cellWidth = rendering.grid.cellSize.width;
          
          var highlight = angular.element('<div>');
          highlight.addClass('wg-preview-item');
          highlight.addClass('wg-preview-highlight');
          highlight.css('top', (area.top - 1) * cellHeight + '%');
          highlight.css('left', (area.left - 1) * cellWidth + '%');
          highlight.css('height', area.height * cellHeight + '%');
          highlight.css('width', area.width * cellWidth + '%');
          
          element.append(highlight);
          highlights.push(highlight);
        }
      }
    };
  });
})();
