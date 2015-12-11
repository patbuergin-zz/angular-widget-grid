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
        var activeHighlights = [],
            activeGridLines = [];

        scope.options = scope.options || { showGrid: false };

        scope.$watch('highlight', applyHighlight);
        scope.$watch('options', applyOptions, true);
        scope.$watch('rendering', applyRendering);

        function applyRendering(rendering) {
          if (angular.isDefined(rendering)) {
            updateGridLines(rendering, scope.options);
          }
        }


        function applyOptions(options) {
          updateGridLines(scope.rendering, options);
        }


        function applyHighlight(highlight) {
          clearHighlights();

          if (highlight === null) { return; }

          if (angular.isArray(highlight)) {
            for (var i = 0; i < highlight.length; i++) {
              highlightArea(highlight[i], scope.rendering);
            }
          } else {
            highlightArea(highlight, scope.rendering);
          }
        }


        function updateGridLines(rendering, options) {
          clearGridLines();
          if (options && options.showGrid) {
            showGridLines(rendering);
          }
        }


        function showGridLines(rendering) {
          var cellHeight = rendering.grid.cellSize.height,
              cellWidth = rendering.grid.cellSize.width,
              height = cellHeight + '%',
              width = cellWidth + '%';

          var i, x, y, gridLine;
          for (i = 1; i < rendering.grid.rows; i += 2) {
              y = (i * cellHeight) + '%';
              gridLine = '<div class="wg-preview-item wg-preview-row" style="top: ' + y + '; height: calc(' + height + ' - 1px);"></div>';
              gridLine = angular.element(gridLine);
              element.append(gridLine);
              activeGridLines.push(gridLine);
          }

          for (i = 1; i < rendering.grid.columns; i += 2) {
              x = (i * cellWidth) + '%';
              gridLine = '<div class="wg-preview-item wg-preview-column" style="left: ' + x + '; width: calc(' + width + ' - 1px);"></div>';
              gridLine = angular.element(gridLine);
              element.append(gridLine);
              activeGridLines.push(gridLine);
          }
        }


        function clearHighlights() {
          angular.forEach(activeHighlights, function (activeHighlight) {
            activeHighlight.remove();
          });
          activeHighlights = [];
        }


        function clearGridLines() {
          angular.forEach(activeGridLines, function(activeGridLine) {
            activeGridLine.remove();
          });
          activeGridLines = [];
        }


        function highlightArea(area, rendering) {
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
          activeHighlights.push(highlight);
        }
      }
    };
  });
})();
