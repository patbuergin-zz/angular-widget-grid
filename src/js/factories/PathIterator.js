(function () {
  angular.module('widgetGrid').factory('PathIterator', function (GridPoint) {
    var PathIterator = function PathIterator(start, end) {
      this.start = start;
      this.topDelta = end.top - start.top;
      this.leftDelta = end.left - start.left;
      this.steps = Math.max(Math.abs(this.topDelta), Math.abs(this.leftDelta));
      this.currStep = 0;
      this.currPos = null;
      this.nextPos = new GridPoint(start.top, start.left);
    };


    PathIterator.prototype.hasNext = function () {
      return this.nextPos !== null;
    };


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

    return PathIterator;
  });
})();
