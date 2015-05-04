(function () {
  var GridController = ['$attrs', 'Grid', 'gridRenderer', function ($attrs, Grid, gridRenderer) {
    var self = this;
    
    var gridOptions = {
      columns: $attrs.columns,
      rows: $attrs.rows
    }
    var grid = new Grid(gridOptions);
    var rendering;
    
    self.addWidget = addWidget;
    self.updateGrid = updateGrid;
    self.updateRendering = updateRendering;
    
    function addWidget(widget) {
      grid.add(widget);
      updateGrid();
    }
    
    function updateGrid() {
      var columns = $attrs.columns;
      var rows = $attrs.rows;
      grid.resize(rows, columns);
      updateRendering();
    }
    
    function updateRendering() {
       rendering = gridRenderer.render(grid);

       for (var i = 0; i < grid.widgets.length; i++) {
         var widget = grid.widgets[i];
         widget.style = rendering.getStyle(widget.id);
       }
    }
  }];
  
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
        
        var firstColumnChange = true, firstRowChange = true;
        attrs.$observe('columns', function () {
          if (firstColumnChange) {
            firstColumnChange = false;
          } else {
            ctrl.updateGrid();
          }
        });
        attrs.$observe('rows', function () {
          if (firstRowChange) {
            firstRowChange = false;
          } else {
            ctrl.updateGrid();
          }
        });
      }
    };
  }
})();
