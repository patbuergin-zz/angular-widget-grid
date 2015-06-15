/// <reference path="../../../typings/angularjs/angular.d.ts"/>

(function () {  
  angular.module('widgetGrid').controller('wgGridController', ['$element', '$scope', '$timeout', 'Grid', 'gridRenderer', function ($element, $scope, $timeout, Grid, gridRenderer) {
    var self = this;
    
    var gridOptions = {
      columns: $scope.columns,
      rows: $scope.rows
    };
    self.grid = new Grid(gridOptions);
    self.rendering = null;
    self.highlight = null;
    
    self.addWidget = addWidget;
    self.removeWidget = removeWidget;
    self.updateGridSize = updateGridSize;
    self.updateRendering = updateRendering;
    self.getPositions = getPositions;
    self.rasterizeCoords = rasterizeCoords;
    self.updateWidget = updateWidget;
    self.getWidgetStyle = getWidgetStyle;
    self.isPositionObstructed = isObstructed;
    self.isAreaObstructed = isAreaObstructed;
    self.highlightArea = highlightArea;
    self.resetHighlights = resetHighlights;
    
    $scope.$watch('columns', updateGridSize);
    $scope.$watch('rows', updateGridSize);
    
    updateRendering();
    
    function addWidget(widget) {
      self.grid.add(widget);
      updateRendering();
    }
    
    function removeWidget(widget) {
      self.grid.remove(widget);
      updateRendering();
    }
    
    function updateGridSize() {
      var columns = parseInt($scope.columns);
      var rows = parseInt($scope.rows);
      if (self.grid.columns !== columns || self.grid.rows !== rows) {
        self.grid.resize(rows, columns);
        updateRendering();
        resetHighlights();
      }
    }
    
    function updateRendering() {
      self.rendering = gridRenderer.render(self.grid);
      $scope.$broadcast('rendering-finished');
    }
    
    function updateWidget(widget) {
        self.rendering.updateWidget(widget);
    }
    
    function getWidgetStyle(widget) {
      return self.rendering.getStyle(widget.id);
    }
    
    function getPositions() {
      var gridContainer = $element[0];

      // c.f. jQuery#offset: https://github.com/jquery/jquery/blob/2d715940b9b6fdeed005cd006c8bf63951cf7fb2/src/offset.js#L93-105
      var rect = gridContainer.getBoundingClientRect();
      if (rect.width || rect.height || gridContainer.getClientRects().length) {
        var doc = gridContainer.ownerDocument;
        var docElem = doc.documentElement;
        return {
          top: rect.top + window.pageYOffset - docElem.clientTop,
          left: rect.left + window.pageXOffset - docElem.clientLeft,
          height: rect.height,
          width: rect.width
        };
      }
      return { top: 0, left: 0, height: 0, width: 0 };
    }
    
    function isObstructed(i, j, excludedArea) {
      return self.rendering ? self.rendering.isObstructed(i, j, excludedArea) : true;
    }
    
    function isAreaObstructed(area, excludedArea, fromBottom, fromRight) {
      return self.rendering ? self.rendering.isAreaObstructed(area, excludedArea, fromBottom, fromRight) : true;
    }
    
    function rasterizeCoords(x, y) {
      return self.rendering.rasterizeCoords(x, y, $element[0].clientWidth, $element[0].clientHeight);
    }
    
    function highlightArea(area) {
      if (area.top && area.left && area.height && area.width) {
        $timeout(function () {
          self.highlight = area;
        });
      }
    }
    
    function resetHighlights() {
      $timeout(function () {
        self.highlight = null;
      });
    }
  }]);
  
  angular.module('widgetGrid').directive('wgGrid', gridDirective);
  function gridDirective() {
    return {
      scope: {
        'columns': '@',
        'rows': '@',
        'showGrid': '@?'
      },
      restrict: 'AE',
      controller: 'wgGridController',
      controllerAs: 'gridCtrl',
      transclude: true,
      replace: true,
      templateUrl: 'wg-grid'
    };
  }
})();
