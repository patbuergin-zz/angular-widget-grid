(function () {
  angular.module('widgetGrid').service('gridRenderer', ['GridRendering', 'gridUtil', function (GridRendering, gridUtil) {
    return {
      render: function (grid) {
        // naive impl; lots of room for performance improvements
        
        var rendering = new GridRendering(grid, {});
        
        var widgets = grid && grid.widgets ? grid.widgets : [];
        var sorted = gridUtil.sortWidgets(widgets);
        
        for (var idx = 0; idx < sorted.length; idx++) {
          var widget = sorted[idx];
          
          var position = {};
          
          // scale evenly to fit the width of the grid
          if (widget.width > grid.columns) {
            position.width = grid.columns;
            position.height = Math.max(Math.round((position.width / widget.width) * widget.height), 1);
          } else {
            position.width = widget.width;
            position.height = widget.height;
          }
          
          // check for conflicts
          var needsRepositioning = false;
          
          var i, j;
          // check corners
          if (rendering.isObstructed(widget.top, widget.left) ||
              rendering.isObstructed(widget.top + position.height - 1, widget.left + position.width - 1)) {
            needsRepositioning = true;
          } else {
            // check the entire widget area
            for (i = widget.top; i < widget.top + position.height; i++) {
              for (j = widget.left; j < widget.left + position.width; j++) {
                if (rendering.isObstructed(i, j)) {
                  needsRepositioning = true;
                  break;
                }
              }
              if (needsRepositioning) { break; }
            }
          }
          
          // resolve conflicts, if any
          if (needsRepositioning) {
            i = 1;
            while (needsRepositioning) {
              var widgetFits, widgetRowFits;
              for (j = 1; j <= grid.columns - position.width + 1; j++) {
                // check whether the widget could be placed at (i,j)
                widgetFits = true;
                for (var ii = i; ii < i + position.height; ii++) {
                  widgetRowFits = true;
                  for (var jj = j; jj < j + position.width; jj++) {
                    if (rendering.isObstructed(ii, jj)) {
                      widgetRowFits = false;
                      break;
                    }
                  }
                  if (!widgetRowFits) {
                    widgetFits = false;
                    break;
                  }
                }
                
                if (widgetFits) {
                  position.top = i;
                  position.left = j;
                  needsRepositioning = false;
                  break;
                }
              }
              i++;
              
              if (i === 1337) {
                console.trace();
                console.debug('endless loop', widget, position, rendering.positions);
                break;
              }
            }
          } else {
            position.top = widget.top;
            position.left = widget.left;
          }
          
          rendering.positions[widget.id] = position;
        }
        
        return rendering;
      }
    };
  }]);
})();
