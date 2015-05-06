(function () {
  var DEFAULT_COLUMNS = 4,
      DEFAULT_ROWS = 4;
  
  angular.module('widgetGrid').factory('Grid', ['gridUtil', function (gridUtil) {
    var Grid = function Grid(options) {
      var self = this;

      options = options || {};
      
      self.columns = parseInt(options.columns) || DEFAULT_COLUMNS;
      self.rows = parseInt(options.rows) || DEFAULT_ROWS;
      self.cellSize = gridUtil.computeCellSize(self.rows, self.columns);

      self.widgets = [];
      
      self.add = function (widget) {
        self.widgets.push(widget);
      };

      self.resize = function (rows, columns) {
        columns = parseInt(columns) || 0;
        rows = parseInt(rows) || 0;
        
        if (columns > 0 && rows > 0 && columns !== self.columns || rows !== self.rows) {
          self.columns = columns;
          self.rows = rows;
          self.cellSize = gridUtil.computeCellSize(self.rows, self.columns);
        }
      };
    };

    return Grid;
  }]);
})();
