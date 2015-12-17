(function () {
  /**
   * @ngdoc object
   * @name widgetGrid.GridArea
   * 
   * @description
   * Describes a rectangular area in a grid.
   */
  angular.module('widgetGrid').factory('GridArea', function () {
    /**
     * @ngdoc method
     * @name GridArea
     * @methodOf widgetGrid.GridArea
     * 
     * @description
     * Constructor.
     * 
     * @param {number} top Row in which the area starts
     * @param {number} left Column in which the area starts
     * @param {number} height Height of the area
     * @param {number} width Width of the area
     */
    var GridArea = function GridArea(top, left, height, width) {
      this.top = parseInt(top) || 0;
      this.left = parseInt(left) || 0;
      this.height = parseInt(height) || 0;
      this.width = parseInt(width) || 0;
    };


    /**
     * @ngdoc method
     * @name create
     * @methodOf widgetGrid.GridArea
     * 
     * @description
     * Factory method.
     * 
     * @param {GridPoint} start Top-left corner of the area
     * @param {GridPoint} end Bottom-right corner of the area
     * @return {GridArea} Instance
     */
    GridArea.create = function (start, end) {
      var width = end.left - start.left + 1,
          height = end.top - start.top + 1;
      return new GridArea(start.top, start.left, width, height);
    };


    /**
     * @ngdoc property
     * @name empty
     * @propertyOf widgetGrid.GridArea
     * 
     * @description
     * An empty area.
     */
    GridArea.empty = new GridArea();


    /**
     * @ngdoc method
     * @name getBottom
     * @methodOf widgetGrid.GridArea
     * 
     * @description
     * Returns the row in which the area ends.
     * 
     * @return {number} Bottom row
     */
    GridArea.prototype.getBottom = function () {
      return this.top + this.height - 1;
    };


    /**
     * @ngdoc method
     * @name getRight
     * @methodOf widgetGrid.GridArea
     * 
     * @description
     * Returns the column in which the area ends.
     * 
     * @return {number} Bottom row
     */
    GridArea.prototype.getRight = function () {
      return this.left + this.width - 1;
    };


    /**
     * @ngdoc method
     * @name getSurfaceArea
     * @methodOf widgetGrid.GridArea
     * 
     * @description
     * Computes the GridArea's surface area.
     * 
     * @return {number} Surface area
     */
    GridArea.prototype.getSurfaceArea = function () {
      return this.height * this.width;
    };

    return GridArea;
  });
})();
