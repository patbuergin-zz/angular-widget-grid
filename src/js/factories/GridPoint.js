(function () {
  /**
   * @ngdoc object
   * @name widgetGrid.GridPoint
   * 
   * @description
   * Describes a point in a grid.
   */
  angular.module('widgetGrid').factory('GridPoint', function () {
    /**
     * @ngdoc method
     * @name GridPoint
     * @methodOf widgetGrid.GridPoint
     * 
     * @description
     * Constructor.
     * 
     * @param {number} top Row
     * @param {number} left Column
     */
    var GridPoint = function GridPoint(top, left) {
      this.top = parseInt(top) || 1;
      this.left = parseInt(left) || 1;
    };

    return GridPoint;
  });
})();
