(function () {
  /**
   * @ngdoc object
   * @name widgetGrid.PathIterator
   * 
   * @description
   * Generates a path between two points on a grid.
   * 
   * @requires widgetGrid.GridPoint
   */
  angular.module('widgetGrid').factory('PathIterator', function (GridPoint) {
    /**
     * @ngdoc method
     * @name PathIterator
     * @methodOf widgetGrid.PathIterator
     * 
     * @description
     * Constructor.
     * 
     * @param {GridPoint} start Start point
     * @param {GridPoint} end End point
     */
    var PathIterator = function PathIterator(start, end) {
      this.start = start;
      this.topDelta = end.top - start.top;
      this.leftDelta = end.left - start.left;
      this.steps = Math.max(Math.abs(this.topDelta), Math.abs(this.leftDelta));
      this.currStep = 0;
      this.currPos = null;
      this.nextPos = new GridPoint(start.top, start.left);
    };


    /**
     * @ngdoc method
     * @name next
     * @methodOf widgetGrid.Widget
     * 
     * @description
     * Yields the next point on the path, if any.
     * 
     * @return {GridPoint} Next point on the path
     */
    PathIterator.prototype.next = function () {
      this.currPos = this.nextPos;
      
      if (this.currStep < this.steps) {
        this.currStep++;              
        var currTopDelta = Math.round((this.currStep/this.steps) * this.topDelta);
        var currLeftDelta = Math.round((this.currStep/this.steps) * this.leftDelta);
        this.nextPos = new GridPoint(this.start.top + currTopDelta, this.start.left + currLeftDelta);
      } else {
        this.nextPos = null;
      }

      return this.currPos;
    };


    /**
     * @ngdoc method
     * @name hasNext
     * @methodOf widgetGrid.PathIterator
     * 
     * @description
     * Whether there is a next point on the path.
     * 
     * @return {boolean} Result
     */
    PathIterator.prototype.hasNext = function () {
      return this.nextPos !== null;
    };

    return PathIterator;
  });
})();
