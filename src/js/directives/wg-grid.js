(function () {
  var GridController = function ($attrs, Grid) {
    var self = this;
    
    var gridOptions = {
      columns: $attrs.columns,
      rows: $attrs.rows
    }
    var grid = new Grid(gridOptions);
    
    self.addWidget = addWidget;
    self.resizeGrid = resizeGrid;
    
    function addWidget(widget) {
      grid.add(widget);
      grid.applyStyle(widget);
    }
    
    function resizeGrid() {
      var columns = $attrs.columns;
      var rows = $attrs.rows;
      grid.resize(rows, columns);
    }
  };
  
  angular.module('widgetGrid').controller('wgGridController', GridController);
  
  angular.module('widgetGrid').directive('wgGrid', gridDirective);
  function gridDirective() {
    return {
      scope: true,
      restrict: 'E',
      controller: 'wgGridController',
      controllerAs: 'grid',
      transclude: true,
      replace: true,
      template: '<div class="wg-grid"><div class="wg-grid-overlay"></div><div class="wg-grid-widgets" ng-transclude></div></div>',
      link: function (scope, element, attrs) {
        var ctrl = scope.grid;
        
        attrs.$observe('columns', ctrl.resizeGrid);
        attrs.$observe('rows', ctrl.resizeGrid);
      }
    };
  }
})();
