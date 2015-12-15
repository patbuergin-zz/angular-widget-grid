/**
 * @license angular-widget-grid v0.2.5
 * (c) 2015 Patrick Buergin
 * License: MIT
 * https://github.com/patbuergin/angular-widget-grid
 */
(function () {
  angular.module('widgetGrid', []);
})();

(function () {
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
    highlightNextPosition: false
  };

  angular.module('widgetGrid').controller('wgGridController', ['$element', '$scope', '$timeout', 'Grid', 'gridRenderer', function ($element, $scope, $timeout, Grid, gridRenderer) {
    var vm = this;

    vm.grid = new Grid({
      columns: $scope.columns,
      rows: $scope.rows
    });
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
    vm.isPositionObstructed = isObstructed;
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
      vm.rendering = gridRenderer.render(vm.grid);
      updateNextPositionHighlight();
      assessAvailableGridSpace();
      $scope.$broadcast('wg-update-rendering');
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
      $scope.$emit('wg-update-position', {
        index: getWidgetIndex(widget),
        newPosition: newPosition
      });
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


    function isObstructed(i, j, options) {
      return vm.rendering ? vm.rendering.isObstructed(i, j, options) : true;
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
         
          var widgetContainer = element[0].parentElement,
              widgetElement = angular.element(widgetContainer);

          widgetElement.addClass('wg-moving');
          
          var startPos = {}; // grid positions
          startPos = gridCtrl.getWidgetRenderPosition(scope.widget);
          startPos.bottom = startPos.top + startPos.height - 1;
          startPos.right = startPos.left + startPos.width - 1;
          
          var startRender = {}; // pixel values
          startRender.top = widgetContainer.offsetTop;
          startRender.left = widgetContainer.offsetLeft;
          startRender.height = widgetContainer.clientHeight;
          startRender.width = widgetContainer.clientWidth;
          
          
          event.offsetX = event.offsetX || event.layerX;
          event.offsetY = event.offsetY || event.layerY;
          
          var requestedRender = { top: startRender.top, left: startRender.left };
          
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
            
            requestedRender.top = Math.min(Math.max(dragPositionY - moverOffset.top, 0), gridPositions.height - startRender.height - 1);
            requestedRender.left = Math.min(Math.max(dragPositionX - moverOffset.left, 0), gridPositions.width - startRender.width - 1);
            
            var currentFinalPos = determineFinalPos(startPos, startRender, requestedRender, cellHeight, cellWidth);
            gridCtrl.highlightArea(currentFinalPos);

            widgetElement.css({
              top: requestedRender.top + 'px',
              left: requestedRender.left + 'px'
            });
          }
          
          function onUp(event) {
            event.preventDefault();
            $document.off(eventMove, onMove);
            $document.off(eventUp, onUp);

            var finalPos = determineFinalPos(startPos, startRender, requestedRender, cellHeight, cellWidth);
            gridCtrl.resetHighlights();

            widgetElement.removeClass('wg-moving');
            scope.setWidgetPosition(finalPos);
          }
        }
        
        function determineFinalPos(startPos, startRender, requestedRender, cellHeight, cellWidth) {
          if (startRender.top === requestedRender.top && startRender.left === requestedRender.left) {
            return startPos;
          }
          
          var anchorTop, anchorLeft;
          if ((requestedRender.top % cellHeight) > cellHeight / 2) {
            anchorTop = requestedRender.top + Math.floor(cellHeight);
          } else {
            anchorTop = requestedRender.top;
          }
          
          if ((requestedRender.left % cellWidth) > cellWidth / 2) {
            anchorLeft = requestedRender.left + Math.floor(cellWidth);
          } else {
            anchorLeft = requestedRender.left;
          }
          
          var movedDown = anchorTop >= startRender.top,
              movedRight = anchorLeft >= startRender.left;
              
          var desiredFinalPosition = gridCtrl.rasterizeCoords(anchorLeft, anchorTop);
          
          var path = new PathIterator(desiredFinalPosition, startPos);
          
          // var path = gridUtil.getPathIterator(startPos, { top: desiredFinalPosition.i, left: desiredFinalPosition.j });
          
          while (path.hasNext()) {
            var currPos = path.next();
            
            var targetArea = {
              top: currPos.top,
              left: currPos.left,
              height: startPos.height,
              width: startPos.width
            };
            
            var options = {
              excludedArea: startPos,
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
        MIN_WIDTH = 42,
        ADD_OFFSET = 1;
    
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
            startRender.top = widgetContainer.offsetTop;
            startRender.left = widgetContainer.offsetLeft;
            startRender.height = container.offsetHeight;
            startRender.width = container.offsetWidth;
            startRender.bottom = startRender.top + startRender.height;
            startRender.right = startRender.left + startRender.width;
            
            event.offsetX = event.offsetX || event.layerX;
            event.offsetY = event.offsetY || event.layerY;
            
            // add an offset to avoid ambiguity when faced w/ odd widths and/or heights
            var delta = { top: ADD_OFFSET, right: ADD_OFFSET, bottom: ADD_OFFSET, left: ADD_OFFSET };
            
            var draggerOffset = {
              top: event.offsetY + ADD_OFFSET,
              left: event.offsetX + ADD_OFFSET,
              bottom: event.offsetY - dragger.element[0].offsetHeight + ADD_OFFSET,
              right: event.offsetX - dragger.element[0].offsetWidth + ADD_OFFSET
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
                delta.top = Math.min(Math.max(dragPositionY - draggerOffset.top, 0), gridPositions.height - 1) - startRender.top;
                delta.top = Math.min(delta.top, startRender.height - MIN_HEIGHT);
              } else if (dragger.down) {
                delta.bottom = startRender.bottom - Math.min(Math.max(dragPositionY - draggerOffset.bottom, 0), gridPositions.height - 1);
                delta.bottom = Math.min(delta.bottom, startRender.height - MIN_HEIGHT);
              }
              
              if (dragger.left) {
                delta.left = Math.min(Math.max(dragPositionX - draggerOffset.left, 0), gridPositions.width - 1) - startRender.left; 
                delta.left = Math.min(delta.left, startRender.width - MIN_WIDTH);
              } else if (dragger.right) {
                delta.right = startRender.right - Math.min(Math.max(dragPositionX - draggerOffset.right, 0), gridPositions.width - 1); 
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
              
              var requestedStartPoint = gridCtrl.rasterizeCoords(startRender.left + delta.left, startRender.top + delta.top),
                  requestedEndPoint = gridCtrl.rasterizeCoords(startRender.right - delta.right, startRender.bottom - delta.bottom);

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
                    if (gridCtrl.isPositionObstructed(finalPos.top - 1, j)) {
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
                    if (gridCtrl.isPositionObstructed(finalPos.bottom + 1, j)) {
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
                    if (gridCtrl.isPositionObstructed(i, finalPos.left - 1)) {
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
                    if (gridCtrl.isPositionObstructed(i, finalPos.right + 1)) {
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
        var widgetOptions = scope.position;
        var widget = new Widget(widgetOptions);

        scope.editable = 'false';
        scope.widget = widget;

        scope.getNodeIndex = getNodeIndex;
        scope.setWidgetPosition = setWidgetPosition;

        scope.$on('wg-update-rendering', updateView);
        scope.$on('$destroy', function () {
          gridCtrl.removeWidget(widget);
        });

        gridCtrl.addWidget(widget);

        function getNodeIndex() {
          var index = 0, elem = element[0];
          while ((elem = elem.previousElementSibling) !== null) { ++index; }
          return index;
        }


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
  var DEFAULT_COLUMNS = 4,
      DEFAULT_ROWS = 4;

  angular.module('widgetGrid').factory('Grid', ['gridUtil', function (gridUtil) {
    var Grid = function Grid(options) {
      options = options || {};
      this.widgets = [];
      this.columns = parseInt(options.columns) || DEFAULT_COLUMNS;
      this.rows = parseInt(options.rows) || DEFAULT_ROWS;
      this.cellSize = gridUtil.computeCellSize(this.rows, this.columns);
    };


    Grid.prototype.add = function (widget) {
      this.widgets.push(widget);
    };


    Grid.prototype.remove = function (widget) {
      var widgetIndex = this.widgets.indexOf(widget);
      if (widgetIndex >= 0) {
        this.widgets.splice(widgetIndex, 1);
      }
    };


    Grid.prototype.resize = function (rows, columns) {
      columns = parseInt(columns) || 0;
      rows = parseInt(rows) || 0;

      if (columns > 0 && rows > 0 && columns !== this.columns || rows !== this.rows) {
        this.columns = columns;
        this.rows = rows;
        this.cellSize = gridUtil.computeCellSize(this.rows, this.columns);
      }
    };

    return Grid;
  }]);
})();

(function () {
  angular.module('widgetGrid').factory('GridPosition', function () {
    var GridPosition = function GridPosition(top, left) {
      this.top = parseInt(top) || 1;
      this.left = parseInt(left) || 1;
    };

    return GridPosition;
  });
})();

(function () {
  angular.module('widgetGrid').factory('GridRendering', ['gridUtil', 'GridPosition', function (gridUtil, GridPosition) {
    var GridRendering = function GridRendering(grid) {
      this.grid = grid || { rows: 0, columns: 0 };
      this.positions = {};
      this.cachedNextPosition = undefined;
      this.obstructions = [];
      for (var i = 0; i < this.grid.rows * this.grid.columns; i++) {
          this.obstructions[i] = 0;
      }
    };


    GridRendering.prototype.rasterizeCoords = function (x, y, gridWidth, gridHeight) {
      x = Math.min(Math.max(x, 0), gridWidth - 1);
      y = Math.min(Math.max(y, 0), gridHeight - 1);

      var i = Math.floor(y / gridHeight * this.grid.rows) + 1,
          j = Math.floor(x / gridWidth * this.grid.columns) + 1;
      return new GridPosition(i, j);
    };


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


    GridRendering.prototype.getWidgetPosition = function (widgetId) {
      return this.positions[widgetId];
    };


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


    GridRendering.prototype.hasSpaceLeft = function () {
      for (var i = 0; i < this.obstructions.length; i++) {
        if (!this.obstructions[i]) {
          return true;
        }
      }
      return false;
    };


    GridRendering.prototype.getNextPosition = function () {
      if (angular.isDefined(this.cachedNextPosition)) {
        return this.cachedNextPosition; 
      }

      if (!this.hasSpaceLeft()) {
        return null;
      }

      var maxPosition = gridUtil.findLargestEmptyArea(this);
      this.cachedNextPosition = maxPosition;
      return maxPosition;
    };


    // options: excludedArea, expanding
    GridRendering.prototype.isObstructed = function (i, j, options) {
      options = angular.isObject(options) ? options : {};

      // obstructed if (i, j) exceeds the grid's regular non-expanding boundaries
      if (i < 1 || j < 1 || j > this.grid.columns || (!options.expanding && i > this.grid.rows)) {
        return true;
      }

      // pass if (i, j) is within the excluded area, if any
      if (options.excludedArea &&
          options.excludedArea.top <= i && i <= options.excludedArea.bottom &&
          options.excludedArea.left <= j && j <= options.excludedArea.right) {
        return false;
      }

      return this._isObstructed(i, j);
    };


    // unsafe; w/o bounding box & excluded area
    GridRendering.prototype._isObstructed = function (i, j) {
      return this.obstructions[(i-1) * this.grid.columns + (j-1)] === 1;
    };


    // options: excludedArea, fromBottom, fromRight, expanding
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
          if (this.isObstructed(i, j, options)) {
            return true;
          }
        }
      }
      return false;
    };


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


    GridRendering.prototype.setObstructionValues = function (area, value) {
      // positions are 1-indexed (like matrices)
      for (var i = area.top - 1; i < area.top + area.height - 1; i++) {
        for (var j = area.left - 1; j < area.left + area.width - 1; j++) {
          this.obstructions[i * this.grid.columns + j] = value;
        }
      }
    };


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

    return GridRendering;
  }]);
})();

(function () {
  angular.module('widgetGrid').factory('PathIterator', ['GridPosition', function (GridPosition) {
    var PathIterator = function PathIterator(start, end) {
      this.start = start;
      this.topDelta = end.top - start.top;
      this.leftDelta = end.left - start.left;
      this.steps = Math.max(Math.abs(this.topDelta), Math.abs(this.leftDelta));
      this.currStep = 0;
      this.currPos = null;
      this.nextPos = new GridPosition(start.top, start.left);
    };


    PathIterator.prototype.hasNext = function () {
      return this.nextPos !== null;
    };


    PathIterator.prototype.next = function () {
      this.currPos = this.nextPos;
      
      if (this.currStep < this.steps) {
        this.currStep++;              
        var currTopDelta = Math.round((this.currStep/this.steps) * this.topDelta);
        var currLeftDelta = Math.round((this.currStep/this.steps) * this.leftDelta);
        this.nextPos = new GridPosition(this.start.top + currTopDelta, this.start.left + currLeftDelta);
      } else {
        this.nextPos = null;
      }

      return this.currPos;
    };

    return PathIterator;
  }]);
})();

(function () {
  angular.module('widgetGrid').factory('Widget', ['gridUtil', function (gridUtil) {
    var Widget = function Widget(options) {
      this.id = gridUtil.getUID();
      this.style = {};

      options = options || {};
      this.top = parseInt(options.top) || 0;
      this.left = parseInt(options.left) || 0;
      this.width = parseInt(options.width) || 0;
      this.height = parseInt(options.height) || 0;
    };


    Widget.prototype.setPosition = function (position) {
      this.top =  angular.isNumber(position.top) ? position.top : this.top;
      this.left = angular.isNumber(position.left) ? position.left : this.left;
      this.height = angular.isNumber(position.height) ? position.height : this.height;
      this.width = angular.isNumber(position.width) ? position.width : this.width;
    };


    Widget.prototype.getPosition = function () {
      return {
        top: this.top,
        left: this.left,
        height: this.height,
        width: this.width
      };
    };

    return Widget;
  }]);
})();

(function () {
  var EMPTY_POSITION = { top: 0, left: 0, height: 0, width: 0 };
  
  angular.module('widgetGrid').service('gridRenderer', ['GridRendering', function (GridRendering) {
    var service = {
      render: render
    };

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
          widget.setPosition(EMPTY_POSITION);
          rendering.setWidgetPosition(widget.id, EMPTY_POSITION);
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
   * @requires GridPosition
   */
  angular.module('widgetGrid').service('gridUtil', ['$templateCache', 'GridPosition', function ($templateCache, GridPosition) {
    var service = {
      getTemplate: getTemplate,
      getUID: getUID,
      sortWidgets: sortWidgets,
      findLargestEmptyArea: findLargestEmptyArea,
      computeCellSize: computeCellSize
    };

    /**
     * @ngdoc method
     * @name getTemplate
     * @methodOf widgetGrid.gridUtil
     * 
     * @description
     * Retrieves templates from the cache.
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
     * @name getUID
     * @methodOf widgetGrid.gridUtil
     * 
     * @description
     * Returns a unique identifier.
     * 
     * @return {number} Unique identifier
     */
    var nextId = 1;
    function getUID() {
      return (nextId++).toString();
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


    /**
     * @ngdoc method
     * @name computeCellSize
     * @methodOf widgetGrid.gridUtil
     * 
     * @description
     * Computes the relative size of a single cell, given row and column count of a grid.
     * 
     * @param {number} rowCount Row count
     * @param {number} columnCount Column count
     * @return {object} Cell sizes (%)
     */
    function computeCellSize(rowCount, columnCount) {
      return {
        height: rowCount >= 1 ? 100 / rowCount : 0,
        width: columnCount >= 1 ? 100 / columnCount : 0
      };
    }


    /**
     * @ngdoc method
     * @name findLargestEmptyArea
     * @methodOf widgetGrid.gridUtil
     * 
     * @description
     * Finds the largest non-obstructed area in a given rendering, if any.
     * 
     * @param {GridRendering} rendering Rendering
     * @return {GridArea} Largest empty area, or null
     */
    function findLargestEmptyArea(rendering) {
      if (!angular.isDefined(rendering) || !angular.isDefined(rendering.grid)) {
        return null;
      }

      var grid = rendering.grid;
      var maxPosition = null, currMaxPosition = null,
          maxArea = 0, currMaxArea = 0;
      for (var i = 1; i <= grid.rows; i++) {
        for (var j = 1; j <= grid.columns; j++) {
          if (rendering._isObstructed(i, j)) {
            continue;
          }

          var currAreaLimit = (grid.rows - i + 1) * (grid.columns - j + 1);
          if (currAreaLimit < maxArea) {
            break;
          }

          currMaxPosition = _findLargestEmptyAreaFrom(new GridPosition(i, j), rendering);
          currMaxArea = currMaxPosition.height * currMaxPosition.width;

          if (currMaxArea > maxArea) {
            maxArea = currMaxArea;
            maxPosition = currMaxPosition;
          }
        }
      }
      return maxPosition;
    }


    /**
     * Finds the largest empty area that starts at a given position.
     * 
     * @param {GridPosition} start Start position
     * @return {GridArea} Largest empty area, or null
     */
    function _findLargestEmptyAreaFrom(start, rendering) {
      if (!angular.isDefined(rendering) || !angular.isDefined(rendering.grid) ||
          !angular.isNumber(rendering.grid.columns) || !angular.isNumber(rendering.grid.rows)) {
        return null;
      }

      var maxPosition = null,
          maxArea = 0,
          endColumn = rendering.grid.columns;
      for (var i = start.top; i <= rendering.grid.rows; i++) {
        for (var j = start.left; j <= endColumn; j++) {
          if (rendering._isObstructed(i, j)) {
            endColumn = j - 1;
            continue;
          }

          var currHeight = (i - start.top + 1),
              currWidth = (j - start.left + 1),
              currArea = currHeight * currWidth;

          if (currArea > maxArea) {
            maxArea = currArea;
            maxPosition = {
              top: start.top,
              left: start.left,
              height: currHeight,
              width: currWidth
            };
          }
        }
      }
      return maxPosition;
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
