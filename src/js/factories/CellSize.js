(function () {
  /**
   * @ngdoc object
   * @name widgetGrid.CellSize
   * 
   * @description
   * Describes the relative size of a cell in a grid.
   */
  angular.module('widgetGrid').factory('CellSize', function () {
    /**
     * @ngdoc method
     * @name CellSize
     * @methodOf widgetGrid.CellSize
     * 
     * @description
     * Constructor.
     * 
     * @param {number} height Height of a cell (%)
     * @param {number} width Width of a cell (%)
     */
    var CellSize = function CellSize(height, width) {
      this.height = parseFloat(height) || 0;
      this.width = parseFloat(width) || 0;
    };


    /**
     * @ngdoc method
     * @name create
     * @methodOf widgetGrid.CellSize
     * 
     * @description
     * Factory method.
     * 
     * @param {number} rowCount Row count
     * @param {number} columnCount Column count
     * @return {CellSize} Instance
     */
    CellSize.create = function (rowCount, columnCount) {
      var height = rowCount >= 1 ? 100 / rowCount : 0,
          width = columnCount >= 1 ? 100 / columnCount : 0;
      return new CellSize(height, width);
    };

    return CellSize;
  });
})();
