(function () {
  angular.module('widgetGrid').service('gridRenderer', ['GridRendering', 'gridUtil', function (GridRendering, gridUtil) {
    return {
      render: function (grid, renderStrategy) {
        if (renderStrategy === 'maxSize') {
          return renderMaxSize(grid);
        }
        
        return renderClassic(grid);
      }
    };
    
    function renderMaxSize(grid) {
      var rendering = new GridRendering(grid);
      var widgets = grid && grid.widgets ? grid.widgets : [];
      
      var conflicts = [];
      
      var widget;
      for (var i = 0; i < widgets.length; i++) {
        widget = widgets[i];
        
        if (widget.top === null || widget.left === null ||
            widget.height === null || widget.width === null ||
            rendering.isAreaObstructed(widget)) {
          conflicts.push(widget);
        } else {
          rendering.setWidgetPosition(widget.id, widget);
        }
      }
      
      for (i = 0; i < conflicts.length; i++) {
        widget = conflicts[i];
        
        var nextPosition = rendering.getNextPosition();
        if (nextPosition !== null) {
          widget.setPosition(nextPosition);
          rendering.setWidgetPosition(widget.id, nextPosition);
        } else {
          widget.setPosition({ top: 0, left: 0, height: 0, width: 0 });
          rendering.setWidgetPosition(widget.id, { top: 0, left: 0, height: 0, width: 0 });
        }
      }
      
      return rendering;
    }
    
    function renderClassic(grid) {
      var rendering = new GridRendering(grid);
      
      var widgets = grid && grid.widgets ? grid.widgets : [];
      var sorted = gridUtil.sortWidgets(widgets);
      
      for (var idx = 0; idx < sorted.length; idx++) {
        var widget = sorted[idx];
        
        var position = {};
        
        // if necessary, scale the widget s.t. it fits the width of the grid
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
        
        rendering.setWidgetPosition(widget.id, position);
      }
      
      return rendering;
    }
  }]);
})();
