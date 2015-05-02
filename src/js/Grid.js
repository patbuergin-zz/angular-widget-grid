(function () {
  var DEFAULT_COLUMNS = 4,
      DEFAULT_ROWS = 4;
  
  angular.module('widgetGrid').factory('Grid', function () {
    var Grid = function Grid(options) {
      var self = this;
      
      self.columns = parseInt(options.columns) || DEFAULT_COLUMNS;
      self.rows = parseInt(options.rows) || DEFAULT_ROWS;
      self.cellSize = computeCellSize(self.rows, self.columns);
      
      var stateGrid = initStateGrid(self.rows, self.columns);

      self.widgets = [];
      
      self.add = function (widget) {
        self.widgets.push(widget);
        positionWidget(widget, stateGrid);
      };
      
      self.applyStyle = function (widget) {
        return applyStyle(widget, self.cellSize.height, self.cellSize.width);
      };
      
      self.resize = function (rows, columns) {
        columns = parseInt(columns) || 0;
        rows = parseInt(rows) || 0;
        
        if (columns > 0 && rows > 0 && columns !== self.columns || rows !== self.rows) {
          self.columns = columns;
          self.rows = rows;
          self.cellSize = computeCellSize(self.rows, self.columns);
          
          stateGrid = initStateGrid(self.rows, self.columns);
          positionWidgets(self.widgets, stateGrid, self.cellSize);
        }
      };
    };
    
    function positionWidget(widget, stateGrid) {
      var left = widget.left,
          top = widget.top,
          right = left + widget.width,
          bottom = top + widget.height;
      
      var currGridCell;
      for (var i = top; i < bottom; i++) {
        for (var j = left; j < right; j++) {
          currGridCell = stateGrid[i][j];
          currGridCell.available = false;
          currGridCell.occupant = widget;
        }
      }
    };
     
    function positionWidgets(widgets, stateGrid, cellSize) {
      sortWidgets(widgets);
      for (var i = 0; i < widgets.length; i++) {
        var widget = widgets[i];
        positionWidget(widget, stateGrid);
        applyStyle(widget, cellSize.height, cellSize.width);
      }
    }    
    
    function applyStyle(widget, cellHeight, cellWidth) {
      widget.style.top = (widget.top * cellHeight).toString() + '%';
      widget.style.height = (widget.height * cellHeight).toString() + '%';
      widget.style.left = (widget.left * cellWidth).toString() + '%';
      widget.style.width = (widget.width * cellWidth).toString() + '%';
    }
    
    function sortWidgets(widgets) {
      var sorted = [];
      
      if (!widgets.length || widgets.length < 2) {
        return widgets;
      }
      
      var curr, comp, found;
      for (var i = 0; i < widgets.length; i++) {
        curr = widgets[i];
        
        found = false;
        for (var j = 0; j < sorted.length; j++) {
          comp = sorted[j];
          if (curr.top < comp.top || (curr.top === comp.top && curr.left < comp.left)) {
            sorted.splice(j, 0, curr);
            found = true;
            break;
          }
        }
        if (!found) {
          sorted.push(curr);
        }
      }
      
      widgets = sorted;
    }
    
    function initStateGrid(m, n) {
      var stateGrid = [];
      for (var i = 0; i < m; i++) {
        var row = [];
        for (var j = 0; j < n; j++) {
          row.push({
            available: true,
            occupant: null
          });
        }
        stateGrid.push(row);
      }
      return stateGrid;
    };
          
    function computeCellSize(rowCount, columnCount) {
      return {
        height: 100 / rowCount,
        width: 100 / columnCount
      };
    }
    
    return Grid;
  });
})();
