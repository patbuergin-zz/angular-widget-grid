(function () {
  var DEFAULT_COLUMNS = 4,
      DEFAULT_ROWS = 4;
  
  angular.module('widgetGrid').factory('Grid', ['gridUtil', function (gridUtil) {
    var Grid = function Grid(options) {
      options = options || {};
      
      this.columns = parseInt(options.columns) || DEFAULT_COLUMNS;
      this.rows = parseInt(options.rows) || DEFAULT_ROWS;
      this.cellSize = gridUtil.computeCellSize(this.rows, this.columns);

      this.widgets = [];
    };

    Grid.prototype.add = function (widget) {
      this.widgets.push(widget);
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
  }]);
})();
