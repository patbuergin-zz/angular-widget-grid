(function () {
  var DEFAULT_COLUMNS = 4,
      DEFAULT_ROWS = 4;

  angular.module('widgetGrid').factory('Grid', function (gridUtil) {
    var Grid = function Grid(options) {
      options = options || {};
      this.widgets = [];
      this.columns = parseInt(options.columns) || DEFAULT_COLUMNS;
      this.rows = parseInt(options.rows) || DEFAULT_ROWS;
      this.cellSize = gridUtil.computeCellSize(this.rows, this.columns);
    };


    Grid.prototype.add = function (widget) {
      this.widgets.push(widget);
    };


    Grid.prototype.remove = function (widget) {
      var widgetIndex = this.widgets.indexOf(widget);
      if (widgetIndex >= 0) {
        this.widgets.splice(widgetIndex, 1);
      }
    };


    Grid.prototype.resize = function (rows, columns) {
      columns = parseInt(columns) || 0;
      rows = parseInt(rows) || 0;

      if (columns > 0 && rows > 0 && columns !== this.columns || rows !== this.rows) {
        this.columns = columns;
        this.rows = rows;
        this.cellSize = gridUtil.computeCellSize(this.rows, this.columns);
      }
    };

    return Grid;
  });
})();
