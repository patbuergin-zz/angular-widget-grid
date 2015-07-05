(function () {
  angular.module('widgetGrid').directive('wgGridOverlay', function () {
    return {
      scope: {
        'rendering': '=',
        'highlight': '=?',
        'options': '=?'
      },
      restrict: 'AE',
      replace: true,
      template: '<div class="wg-grid-overlay"></div>',
      link: function (scope, element) {
        var highlights = [];
        
        scope.options = scope.options || { showGrid: false };
        
        scope.$watch('rendering', function (newRendering) {
          if (newRendering) {
            updateGridPreview(newRendering);
            resetHighlights();
          }
        });
        
        scope.$watch('options', function () {
          updateGridPreview(scope.rendering);
        }, true);
        
        scope.$watch('highlight', function (newHighlight) {        
          if (newHighlight !== null) {  
            if (highlights.length > 0) {
              resetHighlights();
            }
            
            if (angular.isArray(newHighlight)) {
              for (var i = 0; i < newHighlight.length; i++) {
                highlightArea(scope.rendering, newHighlight[i]);
              }
            } else {
              highlightArea(scope.rendering, newHighlight);
            }
          } else {
            resetHighlights();
          }
        });
        
        function updateGridPreview(rendering) {
          element.children().remove();
          
          if (scope.options.showGrid) {
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
