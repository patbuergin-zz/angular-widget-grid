(function () {
  angular.module('widgetGrid').service('gridUtil', ['$templateCache', function ($templateCache) {
    var nextId = 1;
    
    return {
      getUID: function () {
        return (nextId++).toString();
      },
      
      sortWidgets: function (widgets) {
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
        
        return sorted;
      },
      
      roundDecimal: function (decimal) {
        return Math.round(decimal * 10000) / 10000;
      },
      
      computeCellSize: function (rowCount, columnCount) {
        return {
          height: rowCount >= 1 ? this.roundDecimal(100 / rowCount) : 0,
          width: columnCount >= 1 ? this.roundDecimal(100 / columnCount) : 0
        };
      },
      
      getTemplate: function (templateName) {
        var template = $templateCache.get(templateName);
        return template ? template : null;
      }
    };
  }]);
})();
