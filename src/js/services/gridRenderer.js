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
          var needsRepositioning = rendering.isAreaObstructed({
            top: widget.top,
            left: widget.left,
            height: position.height,
            width: position.width
          }, { expanding: true });
          
          // resolve conflicts, if any
          if (needsRepositioning) {
            var i = 1;
            while (needsRepositioning) {
              for (var j = 1; j <= grid.columns - position.width + 1; j++) {
                needsRepositioning = rendering.isAreaObstructed({
                  top: i,
                  left: j,
                  height: position.height,
                  width: position.width
                }, { expanding: true });
                
                if (!needsRepositioning) {
                  position.top = i;
                  position.left = j;
                  break;
                }
              }
              i++;
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
