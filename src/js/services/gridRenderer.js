(function () {
  var EMPTY_POSITION = { top: 0, left: 0, height: 0, width: 0 };
  
  angular.module('widgetGrid').service('gridRenderer', function (GridRendering) {
    var service = {
      render: render
    };

    function render(grid) {
      var widgets = grid && grid.widgets ? grid.widgets : [];
      var unpositionedWidgets = [];
      var rendering = new GridRendering(grid);

      angular.forEach(widgets, function (widget) {
        var position = widget.getPosition();
        if (position.width * position.height === 0 ||
            rendering.isAreaObstructed(position)) {
          unpositionedWidgets.push(widget);
        } else {
          rendering.setWidgetPosition(widget.id, widget);
        }
      });

      angular.forEach(unpositionedWidgets, function (widget) {
        var nextPosition = rendering.getNextPosition();
        if (nextPosition !== null) {
          widget.setPosition(nextPosition);
          rendering.setWidgetPosition(widget.id, nextPosition);
        } else {
          widget.setPosition(EMPTY_POSITION);
          rendering.setWidgetPosition(widget.id, EMPTY_POSITION);
        }
      });

      return rendering;
    }

    return service;
  });
})();
