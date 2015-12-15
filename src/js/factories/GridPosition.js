(function () {
  angular.module('widgetGrid').factory('GridPosition', function () {
    var GridPosition = function GridPosition(top, left) {
      this.top = parseInt(top) || 1;
      this.left = parseInt(left) || 1;
    };

    return GridPosition;
  });
})();
