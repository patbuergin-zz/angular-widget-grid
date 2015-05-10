/// <reference path="../../../typings/angularjs/angular.d.ts"/>

(function () {  
  angular.module('widgetGrid').controller('wgGridController', ['$attrs', '$timeout', 'Grid', 'gridRenderer', function ($attrs, $timeout, Grid, gridRenderer) {
    var self = this;
    
    var gridOptions = {
      columns: $attrs.columns,
      rows: $attrs.rows
    };
    self.grid = new Grid(gridOptions);
    var rendering;
    var rootElement;
    
    self.addWidget = addWidget;
    self.updateGrid = updateGrid;
    self.updateRendering = updateRendering;
    self.setRootElement = setRootElement;
    self.getPositions = getPositions;
    self.rasterizeCoords = rasterizeCoords;
    
    function addWidget(widget) {
      self.grid.add(widget);
      updateGrid();
    }
    
    function updateGrid() {
      var columns = $attrs.columns;
      var rows = $attrs.rows;
      self.grid.resize(rows, columns);
      updateRendering();
    }
    
    function updateRendering() {
       rendering = gridRenderer.render(self.grid);

       $timeout(function () {
         for (var i = 0; i < self.grid.widgets.length; i++) {
           var widget = self.grid.widgets[i];
           widget.style = rendering.getStyle(widget.id);
         }
       });
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
    
    function rasterizeCoords(x, y) {
      return rendering.rasterizeCoords(x, y, rootElement[0].clientWidth, rootElement[0].clientHeight);
    }
  }]);
  
  angular.module('widgetGrid').directive('wgGrid', gridDirective);
  function gridDirective() {
    return {
      scope: true,
      restrict: 'E',
      controller: 'wgGridController',
      controllerAs: 'gridCtrl',
      transclude: true,
      replace: true,
      templateUrl: 'wg-grid',
      link: function (scope, element, attrs) {
        var ctrl = scope.gridCtrl;
        
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
