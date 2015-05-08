/// <reference path="../../../typings/angularjs/angular.d.ts"/>

(function () {  
  angular.module('widgetGrid').controller('wgGridController', ['$attrs', 'Grid', 'gridRenderer', function ($attrs, Grid, gridRenderer) {
    var self = this;
    
    var gridOptions = {
      columns: $attrs.columns,
      rows: $attrs.rows
    };
    var grid = new Grid(gridOptions);
    var rendering;
    var rootElement;
    
    self.addWidget = addWidget;
    self.updateGrid = updateGrid;
    self.updateRendering = updateRendering;
    self.setRootElement = setRootElement;
    self.getPositions = getPositions;
    
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
    
    function setRootElement(element) {
      rootElement = element;
    }
    
    function getPositions() {
      if (!rootElement) {
        return {};
      }
      
      return {
        top: rootElement[0].offsetTop,
        left: rootElement[0].offsetLeft,
        height: rootElement[0].clientHeight,
        width: rootElement[0].clientWidth
      };
    }
  }]);
  
  angular.module('widgetGrid').directive('wgGrid', gridDirective);
  function gridDirective() {
    return {
      scope: true,
      restrict: 'E',
      controller: 'wgGridController',
      controllerAs: 'grid',
      transclude: true,
      replace: true,
      templateUrl: 'wg-grid',
      link: function (scope, element, attrs) {
        var ctrl = scope.grid;
        
        ctrl.setRootElement(element);
        
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
