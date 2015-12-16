(function () {
  var DEFAULT_COLUMNS = 4,
      DEFAULT_ROWS = 4;

  /**
   * @ngdoc object
   * @name widgetGrid.Grid
   * 
   * @description
   * Describes a grid.
   * 
   * @requires widgetGrid.CellSize
   */
  angular.module('widgetGrid').factory('Grid', function (CellSize) {
    /**
     * @ngdoc method
     * @name Grid
     * @methodOf widgetGrid.Grid
     * 
     * @description
     * Constructor.
     * 
     * @param {number} rows Row count
     * @param {number} columns Column count
     */
    var Grid = function Grid(rows, columns) {
      this.widgets = [];
      this.rows = parseInt(rows) || DEFAULT_ROWS;
      this.columns = parseInt(columns) || DEFAULT_COLUMNS;
      this.cellSize = CellSize.create(this.rows, this.columns);
    };


    /**
     * @ngdoc method
     * @name add
     * @methodOf widgetGrid.Grid
     * 
     * @description
     * Adds a widget to the grid.
     * 
     * @param {Widget} widget Widget
     */
    Grid.prototype.add = function (widget) {
      this.widgets.push(widget);
    };


    /**
     * @ngdoc method
     * @name remove
     * @methodOf widgetGrid.Grid
     * 
     * @description
     * Removes a widget from the grid, if contained.
     * 
     * @param {Widget} widget Widget
     */
    Grid.prototype.remove = function (widget) {
      var widgetIndex = this.widgets.indexOf(widget);
      if (widgetIndex >= 0) {
        this.widgets.splice(widgetIndex, 1);
      }
    };


    /**
     * @ngdoc method
     * @name resize
     * @methodOf widgetGrid.Grid
     * 
     * @description
     * Changes the size of the grid.
     * 
     * @param {number} rows Row count
     * @param {number} columns Column count
     */
    Grid.prototype.resize = function (rows, columns) {
      columns = parseInt(columns) || 0;
      rows = parseInt(rows) || 0;

      if (columns > 0 && rows > 0 && columns !== this.columns || rows !== this.rows) {
        this.columns = columns;
        this.rows = rows;
        this.cellSize = CellSize.create(this.rows, this.columns);
      }
    };

    return Grid;
  });
})();
