/// <reference path="../../../typings/angularjs/angular.d.ts"/>

(function () {
  var DEFAULT_OPTIONS = {
    showGrid: false,
    highlightNextPosition: false,
    clickThrough: false
  };

  /**
   * @ngdoc controller
   * @name widgetGrid.wgGridController
   *
   * @description
   * Container for dashboard elements ("widgets").
   *
   * @restrict AE
   * @requires $element
   * @requires $scope
   * @requires $timeout
   * @requires widgetGrid.Grid
   * @requires widgetGrid.gridRenderer
   */
  angular.module('widgetGrid').controller('wgGridController', function ($element, $scope, $timeout, Grid, gridRenderer) {
    var vm = this;

    vm.grid = new Grid($scope.rows, $scope.columns);
    vm.rendering = null;
    vm.highlight = null;
    vm.options = DEFAULT_OPTIONS;
    vm.overlayOptions = {};

    vm.addWidget = addWidget;
    vm.removeWidget = removeWidget;
    vm.updateGridSize = updateGridSize;
    vm.updateRendering = updateRendering;
    vm.getPositions = getPositions;
    vm.rasterizeCoords = rasterizeCoords;
    vm.updateWidget = updateWidget;
    vm.getWidgetRenderPosition = getWidgetPosition;
    vm.getWidgetStyle = getWidgetStyle;
    vm.isPointObstructed = isPointObstructed;
    vm.isAreaObstructed = isAreaObstructed;
    vm.highlightArea = highlightArea;
    vm.resetHighlights = resetHighlights;

    $scope.$watch('columns', updateGridSize);
    $scope.$watch('rows', updateGridSize);
    $scope.$watch('options', updateOptions, true);

    updateRendering();

    function addWidget(widget) {
      vm.grid.add(widget);
      updateRendering();
    }


    function removeWidget(widget) {
      vm.grid.remove(widget);
      updateRendering();
    }


    function updateGridSize() {
      var columns = parseInt($scope.columns);
      var rows = parseInt($scope.rows);
      if (vm.grid.columns !== columns || vm.grid.rows !== rows) {
        vm.grid.resize(rows, columns);
        updateRendering();
      }
    }


    function updateOptions() {
      vm.options = angular.extend({}, DEFAULT_OPTIONS, $scope.options);
      vm.overlayOptions.showGrid = vm.options.showGrid;

      vm.grid.maxHeight = vm.options.maxHeight;
      vm.grid.maxWidth = vm.options.maxWidth;

      if (vm.options.highlightNextPosition) {
        updateNextPositionHighlight();
      } else {
        resetHighlights();
      }
    }


    var usedToBeFull = false;
    function updateRendering() {
      vm.rendering = gridRenderer.render(vm.grid, emitUpdatePosition);
      updateNextPositionHighlight();
      assessAvailableGridSpace();
      $scope.$broadcast('wg-update-rendering');
    }


    function emitUpdatePosition(widget) {
      $scope.$emit('wg-update-position', {
        index: getWidgetIndex(widget),
        newPosition: widget.getPosition()
      });
    }

    function assessAvailableGridSpace() {
      var gridHasSpaceLeft = vm.rendering.hasSpaceLeft();
      if (gridHasSpaceLeft && usedToBeFull) {
        $scope.$emit('wg-grid-space-available');
        usedToBeFull = false;
      } else if (!gridHasSpaceLeft && !usedToBeFull) {
        $scope.$emit('wg-grid-full');
        usedToBeFull = true;
      }
    }


    function updateWidget(widget) {
      var newPosition = widget.getPosition();
      vm.rendering.setWidgetPosition(widget.id, newPosition);
      emitUpdatePosition(widget);
      assessAvailableGridSpace();
    }


    function updateNextPositionHighlight() {
      if (vm.options.highlightNextPosition) {
        var nextPos = vm.rendering.getNextPosition();
        vm.highlight = nextPos;
      }
    }


    function getWidgetPosition(widget) {
      return vm.rendering.getWidgetPosition(widget.id);
    }


    function getWidgetStyle(widget) {
      return vm.rendering.getStyle(widget.id);
    }


    function getWidgetIndex(widget) {
      for (var i = vm.grid.widgets.length - 1; i >= 0; i--) {
        if (vm.grid.widgets[i].id === widget.id) {
          return i;
        }
      }
      return -1;
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


    function isPointObstructed(i, j) {
      return vm.rendering ? vm.rendering.isObstructed(i, j) : true;
    }


    function isAreaObstructed(area, options) {
      return vm.rendering ? vm.rendering.isAreaObstructed(area, options) : true;
    }


    function rasterizeCoords(x, y) {
      return vm.rendering.rasterizeCoords(x, y, $element[0].clientWidth, $element[0].clientHeight);
    }


    function highlightArea(area) {
      if (area.top && area.left && area.height && area.width) {
        $timeout(function () {
          vm.highlight = area;
        });
      }
    }


    function resetHighlights() {
      $timeout(function () {
        vm.highlight = null;
      });
    }
  });


  /**
   * @ngdoc directive
   * @name widgetGrid.wgGrid
   *
   * @description
   * Describes the grid, and acts as a container for dashboard items ("widgets").
   *
   * @restict AE
   */
  angular.module('widgetGrid').directive('wgGrid', function () {
    return {
      scope: {
        'columns': '=wgColumns',
        'rows': '=wgRows',
        'options': '=?wgOptions'
      },
      restrict: 'AE',
      controller: 'wgGridController',
      controllerAs: 'gridCtrl',
      transclude: true,
      replace: true,
      templateUrl: 'wg-grid'
    };
  });
})();
