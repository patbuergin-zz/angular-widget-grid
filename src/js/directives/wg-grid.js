/// <reference path="../../../typings/angularjs/angular.d.ts"/>

(function () {  
  angular.module('widgetGrid').controller('wgGridController', ['$attrs', '$element', '$scope', 'Grid', 'gridRenderer', function ($attrs, $element, $scope, Grid, gridRenderer) {
    var self = this;
    
    var gridOptions = {
      columns: $scope.columns,
      rows: $scope.rows
    };
    self.grid = new Grid(gridOptions);
    
    var rendering = null;
    
    self.addWidget = addWidget;
    self.updateGridSize = updateGridSize;
    self.updateRendering = updateRendering;
    self.getPositions = getPositions;
    self.rasterizeCoords = rasterizeCoords;
    self.updateWidget = updateWidget;
    self.getWidgetStyle = getWidgetStyle;
    self.isPositionObstructed = isObstructed;
    self.isAreaObstructed = isAreaObstructed;
    
    $scope.$watch('columns', updateGridSize);
    $scope.$watch('rows', updateGridSize);
    
    function addWidget(widget) {
      self.grid.add(widget);
      updateRendering();
    }
    
    function updateGridSize() {
      var columns = parseInt($scope.columns);
      var rows = parseInt($scope.rows);
      if (self.grid.columns !== columns || self.grid.rows !== rows) {
        self.grid.resize(rows, columns);
        updateRendering();
      }
    }
    
    function updateRendering() {
      rendering = gridRenderer.render(self.grid);
      $scope.$broadcast('rendering-finished');
    }
    
    function updateWidget(widget) {
        rendering.updateWidget(widget);
    }
    
    function getWidgetStyle(widget) {
      return rendering.getStyle(widget.id);
    }
    
    function getPositions() {
      return {
        top: $element[0].offsetTop,
        left: $element[0].offsetLeft,
        height: $element[0].clientHeight,
        width: $element[0].clientWidth
      };
    }
    
    function isObstructed(i, j, excludedArea) {
      return rendering ? rendering.isObstructed(i, j, excludedArea) : true;
    }
    
    function isAreaObstructed(area, excludedArea, fromBottom, fromRight) {
      return rendering ? rendering.isAreaObstructed(area, excludedArea, fromBottom, fromRight) : true;
    }
    
    function rasterizeCoords(x, y) {
      return rendering.rasterizeCoords(x, y, $element[0].clientWidth, $element[0].clientHeight);
    }
  }]);
  
  angular.module('widgetGrid').directive('wgGrid', gridDirective);
  function gridDirective() {
    return {
      scope: {
        'columns': '@',
        'rows': '@'
      },
      restrict: 'E',
      controller: 'wgGridController',
      controllerAs: 'gridCtrl',
      transclude: true,
      replace: true,
      templateUrl: 'wg-grid'
    };
  }
})();
