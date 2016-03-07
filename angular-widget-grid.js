/**
 * @license angular-widget-grid v0.2.5
 * (c) 2016 Patrick Buergin
 * License: MIT
 * https://github.com/patbuergin/angular-widget-grid
 */
(function () {
  angular.module('widgetGrid', []);
})();

(function () {
  /**
   * @ngdoc directive
   * @name widgetGrid.wgGridOverlay
   *
   * @description
   * Manages overlays on the grid, namely grid lines and area highlights.
   *
   * @restict AE
   */
  angular.module('widgetGrid').directive('wgGridOverlay', function () {
    return {
      scope: {
        'rendering': '=',
        'highlight': '=?',
        'options': '=?'
      },
      restrict: 'AE',
      replace: true,
      template: '<div class="wg-grid-overlay"></div>',
      link: function (scope, element) {
        var activeHighlights = [],
            activeGridLines = [];

        scope.options = scope.options || { showGrid: false };

        scope.$watch('highlight', applyHighlight);
        scope.$watch('options', applyOptions, true);
        scope.$watch('rendering', applyRendering);

        function applyRendering(rendering) {
          if (angular.isDefined(rendering)) {
            updateGridLines(rendering, scope.options);
          }
        }


        function applyOptions(options) {
          updateGridLines(scope.rendering, options);
        }


        function applyHighlight(highlight) {
          clearHighlights();

          if (highlight === null) { return; }

          if (angular.isArray(highlight)) {
            for (var i = 0; i < highlight.length; i++) {
              highlightArea(highlight[i], scope.rendering);
            }
          } else {
            highlightArea(highlight, scope.rendering);
          }
        }


        function updateGridLines(rendering, options) {
          clearGridLines();
          if (options && options.showGrid) {
            showGridLines(rendering);
          }
        }


        function showGridLines(rendering) {
          var cellHeight = rendering.grid.cellSize.height,
              cellWidth = rendering.grid.cellSize.width,
              height = cellHeight + '%',
              width = cellWidth + '%';

          var i, x, y, gridLine;
          for (i = 1; i < rendering.grid.rows; i += 2) {
              y = (i * cellHeight) + '%';
              gridLine = '<div class="wg-preview-item wg-preview-row" style="top: ' + y + '; height: calc(' + height + ' - 1px);"></div>';
              gridLine = angular.element(gridLine);
              element.append(gridLine);
              activeGridLines.push(gridLine);
          }

          for (i = 1; i < rendering.grid.columns; i += 2) {
              x = (i * cellWidth) + '%';
              gridLine = '<div class="wg-preview-item wg-preview-column" style="left: ' + x + '; width: calc(' + width + ' - 1px);"></div>';
              gridLine = angular.element(gridLine);
              element.append(gridLine);
              activeGridLines.push(gridLine);
          }
        }


        function clearHighlights() {
          angular.forEach(activeHighlights, function (activeHighlight) {
            activeHighlight.remove();
          });
          activeHighlights = [];
        }


        function clearGridLines() {
          angular.forEach(activeGridLines, function(activeGridLine) {
            activeGridLine.remove();
          });
          activeGridLines = [];
        }


        function highlightArea(area, rendering) {
          var cellHeight = rendering.grid.cellSize.height,
              cellWidth = rendering.grid.cellSize.width;

          var highlight = angular.element('<div>');
          highlight.addClass('wg-preview-item');
          highlight.addClass('wg-preview-highlight');
          highlight.css('top', (area.top - 1) * cellHeight + '%');
          highlight.css('left', (area.left - 1) * cellWidth + '%');
          highlight.css('height', area.height * cellHeight + '%');
          highlight.css('width', area.width * cellWidth + '%');

          element.append(highlight);
          activeHighlights.push(highlight);
        }
      }
    };
  });
})();

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
   * @restict AE
   * @requires $element
   * @requires $scope
   * @requires $timeout
   * @requires widgetGrid.Grid
   * @requires widgetGrid.gridRenderer
   */
  angular.module('widgetGrid').controller('wgGridController', ['$element', '$scope', '$timeout', 'Grid', 'gridRenderer', function ($element, $scope, $timeout, Grid, gridRenderer) {
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
  }]);


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
        'columns': '@',
        'rows': '@',
        'options': '=?'
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

(function () {
  angular.module('widgetGrid').directive('wgMovable', ['gridUtil', function (gridUtil) {
    return {
      restrict: 'A',
      require: 'wgWidget',
      link: {
        pre: function (scope, element, attrs, widgetCtrl) {
          // init & append template
          var templateContent = gridUtil.getTemplate('wg-movable');
          if (templateContent) {
            var template = angular.element(templateContent);
            element.append(template);
            widgetCtrl.innerCompile(template);
          }
        }
      }
    };
  }]);


  angular.module('widgetGrid').directive('wgMover', ['$document', 'gridUtil', 'PathIterator', function ($document, gridUtil, PathIterator) {
    return {
      restrict: 'A',
      require: '^wgGrid',
      link: function (scope, element, attrs, gridCtrl) {
        var eventDown, eventMove, eventUp;
        if (window.navigator.pointerEnabled) {
          eventDown = 'pointerdown';
          eventMove = 'pointermove';
          eventUp = 'pointerup';
        } else {
          eventDown = 'mousedown touchstart';
          eventMove = 'mousemove touchmove';
          eventUp = 'mouseup touchend touchcancel';
        }

        element.on(eventDown, onDown);

        function onDown(event) {
          event.preventDefault();
          if (angular.isObject(event.originalEvent)) {
            event = event.originalEvent;
          }

          var mouseDownPosition = { x: event.clientX, y: event.clientY };
          var widgetContainer = element[0].parentElement,
              widgetElement = angular.element(widgetContainer);

          widgetElement.addClass('wg-moving');

          var startPosition = {}; // grid positions
          startPosition = gridCtrl.getWidgetRenderPosition(scope.widget);
          startPosition.bottom = startPosition.top + startPosition.height - 1;
          startPosition.right = startPosition.left + startPosition.width - 1;

          var startRender = {}; // pixel values
          startRender.top = widgetContainer.offsetTop;
          startRender.left = widgetContainer.offsetLeft;
          startRender.height = widgetContainer.clientHeight;
          startRender.width = widgetContainer.clientWidth;

          event.offsetX = event.offsetX || event.layerX;
          event.offsetY = event.offsetY || event.layerY;

          var desiredPosition = { top: startRender.top, left: startRender.left };

          var moverOffset = {
            top: event.offsetY + element[0].offsetTop || 0,
            left: event.offsetX + element[0].offsetLeft || 0
          };

          var gridPositions = gridCtrl.getPositions();
          var cellHeight = (gridCtrl.grid.cellSize.height / 100) * gridPositions.height,
              cellWidth = (gridCtrl.grid.cellSize.width / 100) * gridPositions.width;

          $document.on(eventMove, onMove);
          $document.on(eventUp, onUp);

          function onMove(event) {
            event.preventDefault();

            if (angular.isObject(event.originalEvent)) {
              event = event.originalEvent;
            }

            if (event.touches) {
              event.clientX = event.touches[0].clientX;
              event.clientY = event.touches[0].clientY;
            }

            // normalize the drag position
            var dragPositionX = Math.round(event.clientX) - gridPositions.left,
                dragPositionY = Math.round(event.clientY) - gridPositions.top;

            desiredPosition.top = Math.min(Math.max(dragPositionY - moverOffset.top, 0), gridPositions.height - startRender.height - 1);
            desiredPosition.left = Math.min(Math.max(dragPositionX - moverOffset.left, 0), gridPositions.width - startRender.width - 1);

            var currentFinalPos = determineFinalPos(startPosition, desiredPosition, startRender, cellHeight, cellWidth);
            gridCtrl.highlightArea(currentFinalPos);

            widgetElement.css({
              top: desiredPosition.top + 'px',
              left: desiredPosition.left + 'px'
            });
          }

          function onUp(event) {
            event.preventDefault();
            $document.off(eventMove, onMove);
            $document.off(eventUp, onUp);

            if (gridCtrl.options.clickThrough) {
                if (event.clientX === mouseDownPosition.x && event.clientY === mouseDownPosition.y) {
                    // user clicked but didn't drag the widget, so pass the onDown event to the underlying element
                    element.hide();
                    var elBeneath = document.elementFromPoint(mouseDownPosition.x, mouseDownPosition.y);
                    element.show();
                    angular.element(elBeneath).trigger('click');
                }
            }

            var finalPos = determineFinalPos(startPosition, desiredPosition, startRender, cellHeight, cellWidth);
            gridCtrl.resetHighlights();
            widgetElement.removeClass('wg-moving');
            scope.setWidgetPosition(finalPos);
          }
        }


        /**
         * Determines a final area after moving an element, given
         */
        function determineFinalPos(startPosition, desiredPosition, startRender, cellHeight, cellWidth) {
          if (startRender.top === desiredPosition.top && startRender.left === desiredPosition.left) {
            return startPosition;
          }

          var anchorTop, anchorLeft;
          if ((desiredPosition.top % cellHeight) > cellHeight / 2) {
            anchorTop = desiredPosition.top + Math.floor(cellHeight);
          } else {
            anchorTop = desiredPosition.top;
          }

          if ((desiredPosition.left % cellWidth) > cellWidth / 2) {
            anchorLeft = desiredPosition.left + Math.floor(cellWidth);
          } else {
            anchorLeft = desiredPosition.left;
          }

          var movedDown = anchorTop >= startRender.top,
              movedRight = anchorLeft >= startRender.left;

          var desiredFinalPosition = gridCtrl.rasterizeCoords(anchorLeft, anchorTop);
          var path = new PathIterator(desiredFinalPosition, startPosition);

          while (path.hasNext()) {
            var currPos = path.next();

            var targetArea = {
              top: currPos.top,
              left: currPos.left,
              height: startPosition.height,
              width: startPosition.width
            };

            var options = {
              excludedArea: startPosition,
              fromBottom: movedDown,
              fromRight: movedRight
            };

            if (!gridCtrl.isAreaObstructed(targetArea, options)) {
              // try to get closer to the desired position by leaving the original path
              if (desiredFinalPosition.top < targetArea.top) {
                while (desiredFinalPosition.top <= targetArea.top - 1 &&
                       !gridCtrl.isAreaObstructed({ top: targetArea.top - 1,
                                                    left: targetArea.left,
                                                    height: targetArea.height,
                                                    width: targetArea.width }, options)) {
                  targetArea.top--;
                }
              } else if (desiredFinalPosition.top > targetArea.top) {
                while (desiredFinalPosition.top >= targetArea.top + 1 &&
                       !gridCtrl.isAreaObstructed({ top: targetArea.top + 1,
                                                    left: targetArea.left,
                                                    height: targetArea.height,
                                                    width: targetArea.width }, options)) {
                  targetArea.top++;
                }
              }

              if (desiredFinalPosition.left < targetArea.left) {
                while (desiredFinalPosition.left <= targetArea.left - 1 &&
                       !gridCtrl.isAreaObstructed({ top: targetArea.top,
                                                    left: targetArea.left - 1,
                                                    height: targetArea.height,
                                                    width: targetArea.width }, options)) {
                  targetArea.left--;
                }
              } else if (desiredFinalPosition.left > targetArea.left) {
                while (desiredFinalPosition.left >= targetArea.left + 1 &&
                       !gridCtrl.isAreaObstructed({ top: targetArea.top,
                                                    left: targetArea.left + 1,
                                                    height: targetArea.height,
                                                    width: targetArea.width }, options)) {
                  targetArea.left++;
                }
              }

              return targetArea;
            }
          }
        }
      }
    };
  }]);
})();

(function () {
  angular.module('widgetGrid').directive('wgResizable', ['gridUtil', function (gridUtil) {
    return {
      restrict: 'A',
      require: 'wgWidget',
      link: {
        pre: function (scope, element, attrs, widgetCtrl) {
          // init & append template
          var templateContent = gridUtil.getTemplate('wg-resizable');
          if (templateContent) {
            var template = angular.element(templateContent);
            element.append(template);
            widgetCtrl.innerCompile(template);
          }
        }
      },
      controller: ['$attrs', '$parse', '$scope', function ($attrs, $parse, $scope) {
        var vm = this;

        var DEFAULT_DIRECTIONS = ['NW', 'N', 'NE', 'E', 'SE', 'S', 'SW', 'W'];

        vm.getResizeDirections = function () {
            var attrValue = $parse($attrs.wgResizable)($scope);
            return attrValue && attrValue.directions ? attrValue.directions : DEFAULT_DIRECTIONS;
        };
      }],
      controllerAs: 'resizableCtrl'
    };
  }]);


  angular.module('widgetGrid').directive('wgResizer', ['$document', function ($document) {
    var MIN_HEIGHT = 42,
        MIN_WIDTH = 42;

    return {
      restrict: 'A',
      require: ['^wgGrid', '^wgResizable'],
      link: function (scope, element, attrs, ctrls) {
        var gridCtrl = ctrls[0],
            resizableCtrl = ctrls[1];

        var eventDown, eventMove, eventUp;
        if (window.navigator.pointerEnabled) {
          eventDown = 'pointerdown';
          eventMove = 'pointermove';
          eventUp = 'pointerup';
        } else {
          eventDown = 'mousedown touchstart';
          eventMove = 'mousemove touchmove';
          eventUp = 'mouseup touchend touchcancel';
        }

        var draggers = {
          N: { up: true, right: false, down: false, left: false, element: angular.element('<div class="wg-resize wg-resize-axis wg-resize-n"></div>') },
          E: { up: false, right: true, down: false, left: false, element: angular.element('<div class="wg-resize wg-resize-axis wg-resize-e"></div>') },
          S: { up: false, right: false, down: true, left: false, element: angular.element('<div class="wg-resize wg-resize-axis wg-resize-s"></div>') },
          W: { up: false, right: false, down: false, left: true, element: angular.element('<div class="wg-resize wg-resize-axis wg-resize-w"></div>') },
          NW: { up: true, right: false, down: false, left: true, element: angular.element('<div class="wg-resize wg-resize-diag wg-resize-nw"></div>') },
          NE: { up: true, right: true, down: false, left: false, element: angular.element('<div class="wg-resize wg-resize-diag wg-resize-ne"></div>') },
          SE: { up: false, right: true, down: true, left: false, element: angular.element('<div class="wg-resize wg-resize-diag wg-resize-se"></div>') },
          SW: { up: false, right: false, down: true, left: true, element: angular.element('<div class="wg-resize wg-resize-diag wg-resize-sw"></div>') }
        };

        var directions = resizableCtrl.getResizeDirections();
        for (var i = 0; i < directions.length; i++) {
          var dragger = draggers[angular.uppercase(directions[i])];
          if (angular.isDefined(dragger)) {
            registerDragHandler(dragger, element);
            element.append(dragger.element);
          }
        }

        function registerDragHandler(dragger, containerElement) {
          dragger.element.on(eventDown, onDown);

          function onDown(event) {
            event.preventDefault();

            if (angular.isObject(event.originalEvent)) {
              event = event.originalEvent;
            }

            dragger.element.addClass('dragging');

            var container = containerElement[0],
                widgetContainer = container.parentElement,
                widgetElement = angular.element(widgetContainer);

            widgetElement.addClass('wg-resizing');

            var startPos = {}; // grid positions
            startPos.top = scope.widget.top;
            startPos.left = scope.widget.left;
            startPos.bottom = startPos.top + scope.widget.height - 1;
            startPos.right = startPos.left + scope.widget.width - 1;

            var startRender = {}; // pixel values
            startRender.top = Math.ceil(widgetContainer.offsetTop);
            startRender.left = Math.ceil(widgetContainer.offsetLeft);
            startRender.height = Math.floor(container.offsetHeight);
            startRender.width = Math.floor(container.offsetWidth);
            startRender.bottom = startRender.top + startRender.height;
            startRender.right = startRender.left + startRender.width;

            event.offsetX = event.offsetX || event.layerX;
            event.offsetY = event.offsetY || event.layerY;

            var delta = { top: 0, right: 0, bottom: 0, left: 0 };
            var draggerOffset = {
              top: event.offsetY,
              left: event.offsetX,
              bottom: event.offsetY - dragger.element[0].offsetHeight,
              right: event.offsetX - dragger.element[0].offsetWidth
            };

            var gridPositions = gridCtrl.getPositions();

            $document.on(eventMove, onMove);
            $document.on(eventUp, onUp);

            function onMove(event) {
              event.preventDefault();

              if (angular.isObject(event.originalEvent)) {
                event = event.originalEvent;
              }

              if (event.touches) {
                event.clientX = event.touches[0].clientX;
                event.clientY = event.touches[0].clientY;
              }

              // normalize the drag position
              var dragPositionX = Math.round(event.clientX) - gridPositions.left,
                  dragPositionY = Math.round(event.clientY) - gridPositions.top;

              if (dragger.up) {
                delta.top = Math.min(Math.max(dragPositionY - draggerOffset.top, 0), gridPositions.height) - startRender.top;
                delta.top = Math.min(delta.top, startRender.height - MIN_HEIGHT);
              } else if (dragger.down) {
                delta.bottom = startRender.bottom - Math.min(Math.max(dragPositionY - draggerOffset.bottom, 0), gridPositions.height);
                delta.bottom = Math.min(delta.bottom, startRender.height - MIN_HEIGHT);
              }

              if (dragger.left) {
                delta.left = Math.min(Math.max(dragPositionX - draggerOffset.left, 0), gridPositions.width) - startRender.left;
                delta.left = Math.min(delta.left, startRender.width - MIN_WIDTH);
              } else if (dragger.right) {
                delta.right = startRender.right - Math.min(Math.max(dragPositionX - draggerOffset.right, 0), gridPositions.width);
                delta.right = Math.min(delta.right, startRender.width - MIN_WIDTH);
              }

              var currentFinalPos = determineFinalPos();
              gridCtrl.highlightArea(currentFinalPos);

              containerElement.css({
                top: delta.top + 'px',
                left: delta.left + 'px',
                bottom: delta.bottom + 'px',
                right: delta.right + 'px'
              });
            }

            function onUp(event) {
              event.preventDefault();
              $document.off(eventMove, onMove);
              $document.off(eventUp, onUp);


              var finalPos = determineFinalPos();
              scope.setWidgetPosition(finalPos);
              gridCtrl.resetHighlights();

              // reset style
              widgetElement.removeClass('wg-resizing');
              dragger.element.removeClass('dragging');
              containerElement.removeAttr('style');
            }

            function determineFinalPos() {
              var finalPos = {};

              var requestedStartPoint = gridCtrl.rasterizeCoords(startRender.left + delta.left + 1, startRender.top + delta.top + 1),
                  requestedEndPoint = gridCtrl.rasterizeCoords(startRender.right - delta.right - 1, startRender.bottom - delta.bottom - 1);

              var requestedPos = {
                top: requestedStartPoint.top,
                right: requestedEndPoint.left,
                bottom: requestedEndPoint.top,
                left: requestedStartPoint.left
              };

              // determine a suitable final position (one that is not obstructed)
              var foundCollision, i, j;
              if (dragger.up && requestedPos.top < startPos.top) {
                finalPos.top = startPos.top;

                while (finalPos.top > requestedPos.top) {
                  // check whether adding another row would cause any conflict
                  foundCollision = false;
                  for (j = Math.max(startPos.left, requestedPos.left); j <= Math.min(startPos.right, requestedPos.right); j++) {
                    if (gridCtrl.isPointObstructed(finalPos.top - 1, j)) {
                      foundCollision = true;
                      break;
                    }
                  }
                  if (foundCollision) { break; }

                  finalPos.top--; // add row
                }
              } else if (dragger.down && requestedPos.bottom > startPos.bottom) {
                finalPos.bottom = startPos.bottom;

                while (finalPos.bottom < requestedPos.bottom) {
                  foundCollision = false;
                  for (j = Math.max(startPos.left, requestedPos.left); j <= Math.min(startPos.right, requestedPos.right); j++) {
                    if (gridCtrl.isPointObstructed(finalPos.bottom + 1, j)) {
                      foundCollision = true;
                      break;
                    }
                  }
                  if (foundCollision) { break; }

                  finalPos.bottom++;
                }
              }

              finalPos.top = finalPos.top || requestedPos.top;
              finalPos.bottom = finalPos.bottom || requestedPos.bottom;

              if (dragger.left && requestedPos.left < startPos.left) {
                finalPos.left = startPos.left;

                while (finalPos.left > requestedPos.left) {
                  // check whether adding another column would cause any conflict
                  foundCollision = false;
                  for (i = finalPos.top; i <= finalPos.bottom; i++) {
                    if (gridCtrl.isPointObstructed(i, finalPos.left - 1)) {
                      foundCollision = true;
                      break;
                    }
                  }
                  if (foundCollision) { break; }

                  finalPos.left--; // add column
                }
              } else if (dragger.right && requestedPos.right > startPos.right) {
                finalPos.right = startPos.right;

                while (finalPos.right < requestedPos.right) {
                  foundCollision = false;
                  for (i = finalPos.top; i <= finalPos.bottom; i++) {
                    if (gridCtrl.isPointObstructed(i, finalPos.right + 1)) {
                      foundCollision = true;
                      break;
                    }
                  }
                  if (foundCollision) { break; }

                  finalPos.right++;
                }
              }

              finalPos.right = finalPos.right || requestedPos.right;
              finalPos.left = finalPos.left || requestedPos.left;
              finalPos.height = finalPos.bottom - finalPos.top + 1;
              finalPos.width = finalPos.right - finalPos.left + 1;

              return finalPos;
            }
          }
        }
      }
    };
  }]);
})();

(function () {
  angular.module('widgetGrid').controller('wgWidgetController', ['$scope', '$compile', function($scope, $compile) {
    this.innerCompile = function (element) {
      $compile(element)($scope);
    };
  }]);


  /**
   * @ngdoc directive
   * @name widgetGrid.wgWidget
   *
   * @description
   * Container for dashboard elements ("widgets").
   *
   * @restict AE
   * @requires widgetGrid.Widget
   */
  angular.module('widgetGrid').directive('wgWidget', ['Widget', function (Widget) {
    return {
      scope: {
        position: '=',
        editable: '@?'
      },
      restrict: 'AE',
      controller: 'wgWidgetController',
      require: '^wgGrid',
      transclude: true,
      templateUrl: 'wg-widget',
      replace: true,
      link: function (scope, element, attrs, gridCtrl) {
        var widget = new Widget(scope.position);

        scope.editable = 'false';
        scope.widget = widget;

        scope.setWidgetPosition = setWidgetPosition;

        scope.$watch('position', function(newValue, oldValue) {
          if (newValue.top !== oldValue.top || newValue.left !== oldValue.left ||
              newValue.width !== oldValue.width || newValue.height !== oldValue.height ) {
            setWidgetPosition(newValue);
          }
        }, true);

        scope.$on('wg-update-rendering', updateView);
        scope.$on('$destroy', function () {
          gridCtrl.removeWidget(widget);
        });

        gridCtrl.addWidget(widget);


        /**
         * @ngdoc method
         * @name setWidgetPosition
         * @methodOf widgetGrid.wgWidget
         *
         * @description
         * Updates the position of the associated widget instance, and updates the view.
         *
         * @param {GridArea} position Position
         * @return {GridRendering} Rendering
         */
        function setWidgetPosition(position) {
          var oldPosition = widget.getPosition();
          widget.setPosition(position);
          var newPosition = widget.getPosition();

          if (!angular.equals(oldPosition, newPosition)) {
            gridCtrl.updateWidget(widget);
          }
          updateView();
        }


        function updateView() {
          element.css(gridCtrl.getWidgetStyle(widget));
          scope.position = scope.position || {};
          angular.extend(scope.position, widget.getPosition());
        }
      }
    };
  }]);
})();

(function () {
  /**
   * @ngdoc object
   * @name widgetGrid.CellSize
   *
   * @description
   * Describes the relative size of a cell in a grid.
   */
  angular.module('widgetGrid').factory('CellSize', function () {
    /**
     * @ngdoc method
     * @name CellSize
     * @methodOf widgetGrid.CellSize
     *
     * @description
     * Constructor.
     *
     * @param {number} height Height of a cell (%)
     * @param {number} width Width of a cell (%)
     */
    var CellSize = function CellSize(height, width) {
      this.height = parseFloat(height) || 0;
      this.width = parseFloat(width) || 0;
    };


    /**
     * @ngdoc method
     * @name create
     * @methodOf widgetGrid.CellSize
     *
     * @description
     * Factory method.
     *
     * @param {number} rowCount Row count
     * @param {number} columnCount Column count
     * @return {CellSize} Instance
     */
    CellSize.create = function (rowCount, columnCount) {
      var height = rowCount >= 1 ? 100 / rowCount : 0,
          width = columnCount >= 1 ? 100 / columnCount : 0;
      return new CellSize(height, width);
    };

    return CellSize;
  });
})();

(function () {
  var DEFAULT_COLUMNS = 4,
      DEFAULT_ROWS = 4;

  /**
   * @ngdoc object
   * @name widgetGrid.Grid
   *
   * @description
   * Describes a grid.
   *
   * @requires widgetGrid.CellSize
   */
  angular.module('widgetGrid').factory('Grid', ['CellSize', function (CellSize) {
    /**
     * @ngdoc method
     * @name Grid
     * @methodOf widgetGrid.Grid
     *
     * @description
     * Constructor.
     *
     * @param {number} rows Row count
     * @param {number} columns Column count
     */
    var Grid = function Grid(rows, columns) {
      this.widgets = [];
      this.rows = parseInt(rows) || DEFAULT_ROWS;
      this.columns = parseInt(columns) || DEFAULT_COLUMNS;
      this.cellSize = CellSize.create(this.rows, this.columns);
    };


    /**
     * @ngdoc method
     * @name add
     * @methodOf widgetGrid.Grid
     *
     * @description
     * Adds a widget to the grid.
     *
     * @param {Widget} widget Widget
     */
    Grid.prototype.add = function (widget) {
      this.widgets.push(widget);
    };


    /**
     * @ngdoc method
     * @name remove
     * @methodOf widgetGrid.Grid
     *
     * @description
     * Removes a widget from the grid, if contained.
     *
     * @param {Widget} widget Widget
     */
    Grid.prototype.remove = function (widget) {
      var widgetIndex = this.widgets.indexOf(widget);
      if (widgetIndex >= 0) {
        this.widgets.splice(widgetIndex, 1);
      }
    };


    /**
     * @ngdoc method
     * @name resize
     * @methodOf widgetGrid.Grid
     *
     * @description
     * Changes the size of the grid.
     *
     * @param {number} rows Row count
     * @param {number} columns Column count
     */
    Grid.prototype.resize = function (rows, columns) {
      columns = parseInt(columns) || 0;
      rows = parseInt(rows) || 0;

      if (columns > 0 && rows > 0 && columns !== this.columns || rows !== this.rows) {
        this.columns = columns;
        this.rows = rows;
        this.cellSize = CellSize.create(this.rows, this.columns);
      }
    };

    return Grid;
  }]);
})();

(function () {
  /**
   * @ngdoc object
   * @name widgetGrid.GridArea
   *
   * @description
   * Describes a rectangular area in a grid.
   */
  angular.module('widgetGrid').factory('GridArea', function () {
    /**
     * @ngdoc method
     * @name GridArea
     * @methodOf widgetGrid.GridArea
     *
     * @description
     * Constructor.
     *
     * @param {number} top Row in which the area starts
     * @param {number} left Column in which the area starts
     * @param {number} height Height of the area
     * @param {number} width Width of the area
     */
    var GridArea = function GridArea(top, left, height, width) {
      this.top = parseInt(top) || 0;
      this.left = parseInt(left) || 0;
      this.height = parseInt(height) || 0;
      this.width = parseInt(width) || 0;
    };


    /**
     * @ngdoc method
     * @name create
     * @methodOf widgetGrid.GridArea
     *
     * @description
     * Factory method.
     *
     * @param {GridPoint} start Top-left corner of the area
     * @param {GridPoint} end Bottom-right corner of the area
     * @return {GridArea} Instance
     */
    GridArea.create = function (start, end) {
      var width = end.left - start.left + 1,
          height = end.top - start.top + 1;
      return new GridArea(start.top, start.left, width, height);
    };


    /**
     * @ngdoc property
     * @name empty
     * @propertyOf widgetGrid.GridArea
     *
     * @description
     * An empty area.
     */
    GridArea.empty = new GridArea();


    /**
     * @ngdoc method
     * @name getBottom
     * @methodOf widgetGrid.GridArea
     *
     * @description
     * Returns the row in which the area ends.
     *
     * @return {number} Bottom row
     */
    GridArea.prototype.getBottom = function () {
      return this.top + this.height - 1;
    };


    /**
     * @ngdoc method
     * @name getRight
     * @methodOf widgetGrid.GridArea
     *
     * @description
     * Returns the column in which the area ends.
     *
     * @return {number} Bottom row
     */
    GridArea.prototype.getRight = function () {
      return this.left + this.width - 1;
    };


    /**
     * @ngdoc method
     * @name getSurfaceArea
     * @methodOf widgetGrid.GridArea
     *
     * @description
     * Computes the GridArea's surface area.
     *
     * @return {number} Surface area
     */
    GridArea.prototype.getSurfaceArea = function () {
      return this.height * this.width;
    };

    return GridArea;
  });
})();

(function () {
  /**
   * @ngdoc object
   * @name widgetGrid.GridPoint
   *
   * @description
   * Describes a point in a grid.
   */
  angular.module('widgetGrid').factory('GridPoint', function () {
    /**
     * @ngdoc method
     * @name GridPoint
     * @methodOf widgetGrid.GridPoint
     *
     * @description
     * Constructor.
     *
     * @param {number} top Row
     * @param {number} left Column
     */
    var GridPoint = function GridPoint(top, left) {
      this.top = parseInt(top) || 1;
      this.left = parseInt(left) || 1;
    };

    return GridPoint;
  });
})();

(function () {
  /**
   * @ngdoc object
   * @name widgetGrid.GridRendering
   *
   * @description
   * A rendering of a grid, assigning positions to each of its widgets,
   * keeping track of obstructions, and providing utility functions.
   *
   * @requires widgetGrid.GridArea
   * @requires widgetGrid.GridPoint
   */
  angular.module('widgetGrid').factory('GridRendering', ['GridArea', 'GridPoint', function (GridArea, GridPoint) {
    /**
     * @ngdoc method
     * @name GridRendering
     * @methodOf widgetGrid.GridRendering
     *
     * @description
     * Constructor.
     *
     * @param {Grid} grid Rendered grid
     */
    var GridRendering = function GridRendering(grid) {
      this.grid = grid || { rows: 0, columns: 0 };
      this.positions = {};
      this.cachedNextPosition = undefined;
      this.obstructions = [];
      for (var i = 0; i < this.grid.rows * this.grid.columns; i++) {
          this.obstructions[i] = 0;
      }
    };


    /**
     * @ngdoc method
     * @name rasterizeCoords
     * @methodOf widgetGrid.GridRendering
     *
     * @description
     * Returns grid coordinates for a set of pixel coordinates.
     *
     * @param {number} top Top position (px)
     * @param {number} left Left position (px)
     * @param {number} gridWidth Width of the grid container (px)
     * @param {number} gridHeight Height of the grid container (px)
     * @return {GridPoint} Corresponding point on the grid
     */
    GridRendering.prototype.rasterizeCoords = function (top, left, gridWidth, gridHeight) {
      top = Math.min(Math.max(top, 0), gridWidth - 1);
      left = Math.min(Math.max(left, 0), gridHeight - 1);

      var i = Math.floor(left / gridHeight * this.grid.rows) + 1,
          j = Math.floor(top / gridWidth * this.grid.columns) + 1;
      return new GridPoint(i, j);
    };


    /**
     * @ngdoc method
     * @name getWidgetIdAt
     * @methodOf widgetGrid.GridRendering
     *
     * @description
     * Gets the id of the widget at a given grid position, if any.
     *
     * @param {number} i Top position
     * @param {number} j Left position
     */
    GridRendering.prototype.getWidgetIdAt = function (i, j) {
      for (var widgetId in this.positions) {
        var position = this.positions[widgetId];

        if (position.top <= i && i <= (position.top + position.height - 1) &&
            position.left <= j && j <= (position.left + position.width - 1)) {
          return widgetId;
        }
      }
      return null;
    };


    /**
     * @ngdoc method
     * @name getWidgetPosition
     * @methodOf widgetGrid.GridRendering
     *
     * @description
     * Gets the rendered position of a given widget.
     *
     * @param {string} widgetId Id of the widget
     * @return {GridArea} Rendered position
     */
    GridRendering.prototype.getWidgetPosition = function (widgetId) {
      return this.positions[widgetId];
    };


    /**
     * @ngdoc method
     * @name setWidgetPosition
     * @methodOf widgetGrid.GridRendering
     *
     * @description
     * Sets the rendered position for a given widget.
     *
     * @param {string} widgetId Id of the widget
     * @param {GridArea} newPosition Rendered position
     */
    GridRendering.prototype.setWidgetPosition = function (widgetId, newPosition) {
      var currPosition = this.positions[widgetId];
      if (currPosition) {
        this.setObstructionValues(currPosition, 0);
      }

      newPosition = {
        top: angular.isNumber(newPosition.top) ? newPosition.top : currPosition.top,
        left: angular.isNumber(newPosition.left) ? newPosition.left : currPosition.left,
        height: angular.isNumber(newPosition.height) ? newPosition.height : currPosition.height,
        width: angular.isNumber(newPosition.width) ? newPosition.width : currPosition.width
      };
      this.positions[widgetId] = newPosition;

      this.setObstructionValues(this.positions[widgetId], 1);
      this.cachedNextPosition = undefined;
    };


    /**
     * @ngdoc method
     * @name hasSpaceLeft
     * @methodOf widgetGrid.GridRendering
     *
     * @description
     * Whether any cell in the grid is unoccupied.
     *
     * @return {boolean} Has space left
     */
    GridRendering.prototype.hasSpaceLeft = function () {
      for (var i = 0; i < this.obstructions.length; i++) {
        if (!this.obstructions[i]) {
          return true;
        }
      }
      return false;
    };


    /**
     * @ngdoc method
     * @name getNextPosition
     * @methodOf widgetGrid.GridRendering
     *
     * @description
     * Gets the next best unoccupied area in the current rendering, if any.
     * Can e.g. be used to determine positions for newly added widgets.
     *
     * @return {GridPosition} Next position, or null
     */
    GridRendering.prototype.getNextPosition = function () {
      if (angular.isDefined(this.cachedNextPosition)) {
        return this.cachedNextPosition;
      }

      if (!this.hasSpaceLeft()) {
        return null;
      }

      var maxPosition = this.findLargestEmptyArea();
      this.cachedNextPosition = maxPosition;
      return maxPosition;
    };


    /**
     * @ngdoc method
     * @name isObstructed
     * @methodOf widgetGrid.GridRendering
     *
     * @description
     * Checks whether a given point in the grid is obstructed by a widget,
     * considering the current grid's bounds, as well as an optional excluded area.
     *
     * @param {number} i Top position
     * @param {number} j Left position
     * @param {GridArea} excludedArea Area to ignore (optional)
     * @return {boolean} Whether it is obstructed
     */
    GridRendering.prototype.isObstructed = function (i, j, excludedArea) {
      // obstructed if (i, j) exceeds the grid's regular non-expanding boundaries
      if (i < 1 || j < 1 || j > this.grid.columns || i > this.grid.rows) {
        return true;
      }

      // pass if (i, j) is within the excluded area, if any
      if (excludedArea &&
          excludedArea.top <= i &&
          i <= excludedArea.bottom &&
          excludedArea.left <= j &&
          j <= excludedArea.right) {
        return false;
      }

      return this._isObstructed(i, j);
    };


    /**
     * @ngdoc method
     * @name _isObstructed
     * @methodOf widgetGrid.GridRendering
     *
     * @description
     * Checks whether a given point in the grid is obstructed by a widget.
     *
     * @param {number} i Top position
     * @param {number} j Left position
     * @return {boolean} Whether it is obstructed
     */
    GridRendering.prototype._isObstructed = function (i, j) {
      return this.obstructions[(i-1) * this.grid.columns + (j-1)] === 1;
    };


    /**
     * @ngdoc method
     * @name isAreaObstructed
     * @methodOf widgetGrid.GridRendering
     *
     * @description
     * Checks whether a given area in the grid is obstructed by a widget.
     *
     * @param {GridArea} area Area
     * @param {Map<string, any>} options Options: `fromBottom` (start search from bottom), `fromRight` (.. from right), `excludedArea` (area to ignore).
     * @return {boolean} Whether it is obstructed
     */
    GridRendering.prototype.isAreaObstructed = function (area, options) {
      if (!area) { return false; }
      options = angular.isObject(options) ? options : {};

      var top = area.top,
          left = area.left,
          bottom = area.bottom || area.top + area.height - 1,
          right = area.right || area.left + area.width - 1;

      if (!angular.isNumber(top) || !angular.isNumber(left) ||
          !angular.isNumber(bottom) || !angular.isNumber(right)) {
        return false;
      }

      var verticalStart = options.fromBottom ? bottom : top,
          verticalStep = options.fromBottom ? -1 : 1,
          verticalEnd = (options.fromBottom ? top : bottom) + verticalStep;
      var horizontalStart = options.fromRight ? right : left,
          horizontalStep = options.fromRight ? -1 : 1,
          horizontalEnd = (options.fromRight ? left: right) + horizontalStep;

      for (var i = verticalStart; i !== verticalEnd; i += verticalStep) {
        for (var j = horizontalStart; j !== horizontalEnd; j += horizontalStep) {
          if (this.isObstructed(i, j, options.excludedArea)) {
            return true;
          }
        }
      }
      return false;
    };


    /**
     * @ngdoc method
     * @name getStyle
     * @methodOf widgetGrid.GridRendering
     *
     * @description
     * Gets the CSS rules for a given widget.
     *
     * @param {string} widgetId Id of the widget
     * @return {Map<string, string>} CSS rules
     */
    GridRendering.prototype.getStyle = function (widgetId) {
      widgetId = widgetId.id || widgetId;
      var render = this.positions[widgetId];

      if (!render) {
        return { 'display': 'none' };
      }

      return {
        'top': ((render.top - 1) * this.grid.cellSize.height).toString() + '%',
        'height': (render.height * this.grid.cellSize.height).toString() + '%',
        'left': ((render.left - 1) * this.grid.cellSize.width).toString() + '%',
        'width': (render.width * this.grid.cellSize.width).toString() + '%'
      };
    };


    /**
     * @ngdoc method
     * @name setObstructionValues
     * @methodOf widgetGrid.GridRendering
     *
     * @description
     * Sets the obstruction state of an area to a given value.
     *
     * @param {GridArea} area Affected area
     * @param {number} value New obstruction value
     */
    GridRendering.prototype.setObstructionValues = function (area, value) {
      for (var i = area.top - 1; i < area.top + area.height - 1; i++) {
        for (var j = area.left - 1; j < area.left + area.width - 1; j++) {
          this.obstructions[i * this.grid.columns + j] = value;
        }
      }
    };


    /**
     * @ngdoc method
     * @name printObstructions
     * @methodOf widgetGrid.GridRendering
     *
     * @description
     * Prints the current obstruction state of a rendering to the console.
     */
    GridRendering.prototype.printObstructions = function () {
      var row = 'obstructions:';
      for (var i = 0; i < this.grid.columns * this.grid.rows; i++) {
        if (i % this.grid.columns === 0) {
          console.log(row);
          row = '';
        }
        row += this.obstructions[i] + ' ';
      }
      console.log(row);
    };


    /**
     * @ngdoc method
     * @name findLargestEmptyArea
     * @methodOf widgetGrid.GridRendering
     *
     * @description
     * Finds the largest non-obstructed area in a given rendering, if any.
     *
     * @return {GridArea} Largest empty area, or null
     */
    GridRendering.prototype.findLargestEmptyArea = function () {
      var maxArea = null, currMaxArea = null,
          maxSurfaceArea = 0, currMaxSurfaceArea = 0;
      for (var i = 1; i <= this.grid.rows; i++) {
        for (var j = 1; j <= this.grid.columns; j++) {
          if (this._isObstructed(i, j)) {
            continue;
          }

          var currAreaLimit = (this.grid.rows - i + 1) * (this.grid.columns - j + 1);
          if (currAreaLimit < maxSurfaceArea) {
            break;
          }

          currMaxArea = _findLargestEmptyAreaFrom(new GridPoint(i, j), this);
          currMaxSurfaceArea = currMaxArea.getSurfaceArea();

          if (currMaxSurfaceArea > maxSurfaceArea) {
            maxSurfaceArea = currMaxSurfaceArea;
            maxArea = currMaxArea;
          }
        }
      }
      return maxArea;
    };


    /**
     * Finds the largest empty area that starts at a given position.
     *
     * @param {GridPoint} start Start position
     * @return {GridArea} Largest empty area, or null
     */
    function _findLargestEmptyAreaFrom(start, rendering) {
      if (!angular.isDefined(rendering) || !angular.isDefined(rendering.grid) ||
          !angular.isNumber(rendering.grid.columns) || !angular.isNumber(rendering.grid.rows)) {
        return null;
      }

      var maxArea = null,
          maxSurfaceArea = 0,
          endColumn = rendering.grid.columns;
      for (var i = start.top; i <= rendering.grid.rows; i++) {
        for (var j = start.left; j <= endColumn; j++) {
          if (rendering._isObstructed(i, j)) {
            endColumn = j - 1;
            continue;
          }

          var currHeight = (i - start.top + 1),
              currWidth = (j - start.left + 1),
              currSurfaceArea = currHeight * currWidth;

          if (currSurfaceArea > maxSurfaceArea) {
            maxSurfaceArea = currSurfaceArea;
            maxArea = new GridArea(start.top, start.left, currHeight, currWidth);
          }
        }
      }
      return maxArea;
    }

    return GridRendering;
  }]);
})();

(function () {
  /**
   * @ngdoc object
   * @name widgetGrid.PathIterator
   *
   * @description
   * Generates a path between two points on a grid.
   *
   * @requires widgetGrid.GridPoint
   */
  angular.module('widgetGrid').factory('PathIterator', ['GridPoint', function (GridPoint) {
    /**
     * @ngdoc method
     * @name PathIterator
     * @methodOf widgetGrid.PathIterator
     *
     * @description
     * Constructor.
     *
     * @param {GridPoint} start Start point
     * @param {GridPoint} end End point
     */
    var PathIterator = function PathIterator(start, end) {
      this.start = start;
      this.topDelta = end.top - start.top;
      this.leftDelta = end.left - start.left;
      this.steps = Math.max(Math.abs(this.topDelta), Math.abs(this.leftDelta));
      this.currStep = 0;
      this.currPos = null;
      this.nextPos = new GridPoint(start.top, start.left);
    };


    /**
     * @ngdoc method
     * @name next
     * @methodOf widgetGrid.Widget
     *
     * @description
     * Yields the next point on the path, if any.
     *
     * @return {GridPoint} Next point on the path
     */
    PathIterator.prototype.next = function () {
      this.currPos = this.nextPos;

      if (this.currStep < this.steps) {
        this.currStep++;
        var currTopDelta = Math.round((this.currStep/this.steps) * this.topDelta);
        var currLeftDelta = Math.round((this.currStep/this.steps) * this.leftDelta);
        this.nextPos = new GridPoint(this.start.top + currTopDelta, this.start.left + currLeftDelta);
      } else {
        this.nextPos = null;
      }

      return this.currPos;
    };


    /**
     * @ngdoc method
     * @name hasNext
     * @methodOf widgetGrid.PathIterator
     *
     * @description
     * Whether there is a next point on the path.
     *
     * @return {boolean} Result
     */
    PathIterator.prototype.hasNext = function () {
      return this.nextPos !== null;
    };

    return PathIterator;
  }]);
})();

(function () {
  /**
   * @ngdoc object
   * @name widgetGrid.Widget
   *
   * @description
   * Describes a widget container.
   *
   * @requires widgetGrid.GridArea
   */
  angular.module('widgetGrid').factory('Widget', ['GridArea', function (GridArea) {
    /**
     * @ngdoc method
     * @name Widget
     * @methodOf widgetGrid.Widget
     *
     * @description
     * Constructor.
     *
     * @param {GridArea} gridArea Widget position
     */
    var Widget = function Widget(gridArea) {
      this.id = generateUID();

      gridArea = gridArea || GridArea.empty;
      this.top = parseInt(gridArea.top) || 0;
      this.left = parseInt(gridArea.left) || 0;
      this.width = parseInt(gridArea.width) || 0;
      this.height = parseInt(gridArea.height) || 0;
    };


    /**
     * @ngdoc method
     * @name getPosition
     * @methodOf widgetGrid.Widget
     *
     * @description
     * Gets the position of a widget.
     *
     * @return {GridArea} Widget position
     */
    Widget.prototype.getPosition = function () {
      return new GridArea(this.top, this.left, this.height, this.width);
    };


    /**
     * @ngdoc method
     * @name setPosition
     * @methodOf widgetGrid.Widget
     *
     * @description
     * Updates the position of a widget.
     *
     * @param {GridArea} gridArea Widget position
     */
    Widget.prototype.setPosition = function (gridArea) {
      this.top =  angular.isNumber(gridArea.top) ? gridArea.top : this.top;
      this.left = angular.isNumber(gridArea.left) ? gridArea.left : this.left;
      this.width = angular.isNumber(gridArea.width) ? gridArea.width : this.width;
      this.height = angular.isNumber(gridArea.height) ? gridArea.height : this.height;
    };


    /**
     * Generates a unique identifier (UID).
     *
     * @return {number} Unique identifier
     */
    var nextId = 1;
    function generateUID() {
      return (nextId++).toString();
    }

    return Widget;
  }]);
})();

(function () {
  /**
   * @ngdoc service
   * @name widgetGrid.gridRenderer
   *
   * @description
   * Provides methods for rendering grids.
   *
   * @requires widgetGrid.GridArea
   * @requires widgetGrid.GridRendering
   */
  angular.module('widgetGrid').service('gridRenderer', ['GridArea', 'GridRendering', function (GridArea, GridRendering) {
    var service = {
      render: render
    };

    /**
     * @ngdoc method
     * @name render
     * @methodOf widgetGrid.gridRenderer
     *
     * @description
     * Creates a rendering for a given grid, assigning positions to unpositioned widgets,
     * repositioning widgets with non-valid positions, and resolving position clashes.
     *
     * @param {Grid} grid Grid
     * @return {GridRendering} Rendering
     */
    function render(grid) {
      var widgets = grid && grid.widgets ? grid.widgets : [];
      var unpositionedWidgets = [];
      var rendering = new GridRendering(grid);

      angular.forEach(widgets, function (widget) {
        var position = widget.getPosition();
        if (position.width * position.height === 0 ||
            rendering.isAreaObstructed(position)) {
          unpositionedWidgets.push(widget);
        } else {
          rendering.setWidgetPosition(widget.id, widget);
        }
      });

      angular.forEach(unpositionedWidgets, function (widget) {
        var nextPosition = rendering.getNextPosition();
        if (nextPosition !== null) {
          widget.setPosition(nextPosition);
          rendering.setWidgetPosition(widget.id, nextPosition);
        } else {
          widget.setPosition(GridArea.empty);
          rendering.setWidgetPosition(widget.id, GridArea.empty);
        }
        if (emitWidgetPositionUpdated !== undefined) {
          emitWidgetPositionUpdated(widget);
        }
      });

      return rendering;
    }

    return service;
  }]);
})();

(function () {
  /**
   * @ngdoc service
   * @name widgetGrid.gridUtil
   *
   * @description
   * Provides utility functions for various library components.
   *
   * @requires $templateCache
   */
  angular.module('widgetGrid').service('gridUtil', ['$templateCache', function ($templateCache) {
    var service = {
      getTemplate: getTemplate,
      sortWidgets: sortWidgets
    };

    /**
     * @ngdoc method
     * @name getTemplate
     * @methodOf widgetGrid.gridUtil
     *
     * @description
     * Tries to retrieve a template from the cache.
     * The cache is populated by `ngtemplates` during build.
     *
     * @param {string} templateName Cache key
     * @return {string} Markup of the cached template, if any
     */
    function getTemplate(templateName) {
      var template = $templateCache.get(templateName);
      return template ? template : null;
    }


    /**
     * @ngdoc method
     * @name sortWidgets
     * @methodOf widgetGrid.gridUtil
     *
     * @description
     * Sorts a collection of widgets by position, from top-left to bottom-right.
     *
     * @param {Widget[]} widgets Widgets
     * @return {Widget[]} Sorted widgets
     */
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

      return sorted;
    }

    return service;
  }]);
})();

angular.module('widgetGrid').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('wg-grid',
    "<div class=wg-grid><div class=wg-grid-widgets ng-transclude></div><div wg-grid-overlay options=gridCtrl.overlayOptions rendering=gridCtrl.rendering highlight=\"gridCtrl.highlight\"></div>"
  );


  $templateCache.put('wg-movable',
    "<div wg-mover ng-show=\"editable === 'true'\" class=\"wg-widget-edit wg-widget-edit-move\"></div>"
  );


  $templateCache.put('wg-resizable',
    "<div wg-resizer ng-show=\"editable === 'true'\" class=\"wg-widget-edit wg-widget-edit-resize\"></div>"
  );


  $templateCache.put('wg-widget',
    "<div class=wg-widget ng-class=\"{ editable: editable === 'true' }\"><div class=wg-widget-content ng-transclude></div></div>"
  );

}]);
