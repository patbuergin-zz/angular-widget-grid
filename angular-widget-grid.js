/**
 * @license angular-widget-grid v0.2.0
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
        var highlights = [];
        
        scope.options = scope.options || { showGrid: false };
        
        scope.$watch('rendering', function (newRendering) {
          if (newRendering) {
            updateGridPreview(newRendering);
            resetHighlights();
          }
        });
        
        scope.$watch('options', function () {
          updateGridPreview(scope.rendering);
        }, true);
        
        scope.$watch('highlight', function (newHighlight) {        
          if (newHighlight !== null) {  
            if (highlights.length > 0) {
              resetHighlights();
            }
            
            if (angular.isArray(newHighlight)) {
              for (var i = 0; i < newHighlight.length; i++) {
                highlightArea(scope.rendering, newHighlight[i]);
              }
            } else {
              highlightArea(scope.rendering, newHighlight);
            }
          } else {
            resetHighlights();
          }
        });
        
        function updateGridPreview(rendering) {
          element.children().remove();
          
          if (scope.options.showGrid) {
            var cellHeight = rendering.grid.cellSize.height,
                cellWidth = rendering.grid.cellSize.width,
                height = cellHeight + '%',
                width = cellWidth + '%';
            
            // use an interlaced approach to reduce the number of dom elements
            var i, x, y, bar;
            for (i = 1; i < rendering.grid.rows; i += 2) {
                y = (i * cellHeight) + '%';
                bar = '<div class="wg-preview-item wg-preview-row" style="top: ' + y + '; height: calc(' + height + ' - 1px);"></div>';
                element.append(bar);
            }
            
            for (i = 1; i < rendering.grid.columns; i += 2) {
                x = (i * cellWidth) + '%';
                bar = '<div class="wg-preview-item wg-preview-column" style="left: ' + x + '; width: calc(' + width + ' - 1px);"></div>';
                element.append(bar);
            }
          }
        }
        
        function resetHighlights() {
          for (var i = 0; i < highlights.length; i++) {
            highlights[i].remove();
            
          }
          highlights = [];
        }
        
        function highlightArea(rendering, area) {
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
          highlights.push(highlight);
        }
      }
    };
  });
})();

(function () {  
  angular.module('widgetGrid').controller('wgGridController', ['$element', '$scope', '$timeout', 'Grid', 'gridRenderer', function ($element, $scope, $timeout, Grid, gridRenderer) {
    var vm = this;
    
    vm.grid = new Grid({
      columns: $scope.columns,
      rows: $scope.rows
    });
    vm.rendering = null;
    vm.highlight = null;
    
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
  
    var DEFAULT_OPTIONS = {
      showGrid: false,
      highlightNextPosition: false,
      renderStrategy: 'maxSize'
    };
    
    vm.options = DEFAULT_OPTIONS;
    vm.overlayOptions = {};
    
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
      vm.rendering = gridRenderer.render(vm.grid, vm.options.renderStrategy);
      updateNextPositionHighlight();
      assessAvailableGridSpace();
      $scope.$broadcast('wg-finished-rendering');
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
        vm.rendering.setWidgetPosition(widget.id, widget.getPosition());
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
  
  angular.module('widgetGrid').directive('wgGrid', gridDirective);
  function gridDirective() {
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
  }
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
  
  angular.module('widgetGrid').directive('wgMover', ['$document', 'gridUtil', function ($document, gridUtil) {
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
              
          var finalPosRequest = gridCtrl.rasterizeCoords(anchorLeft, anchorTop);
          
          var path = gridUtil.getPathIterator(startPos, { top: finalPosRequest.i, left: finalPosRequest.j });
          
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
              if (finalPosRequest.i < targetArea.top) {
                while (finalPosRequest.i <= targetArea.top - 1 &&
                       !gridCtrl.isAreaObstructed({ top: targetArea.top - 1,
                                                    left: targetArea.left,
                                                    height: targetArea.height,
                                                    width: targetArea.width }, options)) {
                  targetArea.top--;
                }
              } else if (finalPosRequest.i > targetArea.top) {
                while (finalPosRequest.i >= targetArea.top + 1 &&
                       !gridCtrl.isAreaObstructed({ top: targetArea.top + 1,
                                                    left: targetArea.left,
                                                    height: targetArea.height,
                                                    width: targetArea.width }, options)) {
                  targetArea.top++;
                }
              }
              
              if (finalPosRequest.j < targetArea.left) {
                while (finalPosRequest.j <= targetArea.left - 1 &&
                       !gridCtrl.isAreaObstructed({ top: targetArea.top,
                                                    left: targetArea.left - 1,
                                                    height: targetArea.height,
                                                    width: targetArea.width }, options)) {
                  targetArea.left--;
                }
              } else if (finalPosRequest.j > targetArea.left) {
                while (finalPosRequest.j >= targetArea.left + 1 &&
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
      }
    };
  }]);
  
  var INDEX_DRAGGER_N = 0,
      INDEX_DRAGGER_E = 1,
      INDEX_DRAGGER_S = 2,
      INDEX_DRAGGER_W = 3,
      INDEX_DRAGGER_NW = 4,
      INDEX_DRAGGER_NE = 5,
      INDEX_DRAGGER_SE = 6,
      INDEX_DRAGGER_SW = 7;
  var MIN_HEIGHT = 42,
      MIN_WIDTH = 42;
  var ADD_OFFSET = 1;
  
  angular.module('widgetGrid').directive('wgResizer', ['$document', function ($document) {
    return {
      restrict: 'A',
      require: '^wgGrid',
      link: function (scope, element, attrs, gridCtrl) {        
        var draggerElements = element.children();
        
        var draggers = [
          { up: true, right: false, down: false, left: false, element: angular.element(draggerElements[INDEX_DRAGGER_N]) },
          { up: false, right: true, down: false, left: false, element: angular.element(draggerElements[INDEX_DRAGGER_E]) },
          { up: false, right: false, down: true, left: false, element: angular.element(draggerElements[INDEX_DRAGGER_S]) },
          { up: false, right: false, down: false, left: true, element: angular.element(draggerElements[INDEX_DRAGGER_W]) },
          { up: true, right: false, down: false, left: true, element: angular.element(draggerElements[INDEX_DRAGGER_NW]) },
          { up: true, right: true, down: false, left: false, element: angular.element(draggerElements[INDEX_DRAGGER_NE]) },
          { up: false, right: true, down: true, left: false, element: angular.element(draggerElements[INDEX_DRAGGER_SE]) },
          { up: false, right: false, down: true, left: true, element: angular.element(draggerElements[INDEX_DRAGGER_SW]) }
        ];
        
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
         
        for (var i = 0; i < draggers.length; i++) {
          registerDragHandler(draggers[i], element);
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
                top: requestedStartPoint.i,
                right: requestedEndPoint.j,
                bottom: requestedEndPoint.i,
                left: requestedStartPoint.j
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
  angular.module('widgetGrid').controller('wgWidgetController', ['$scope', '$compile', 'Widget', function($scope, $compile) {    
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
        
        scope.getNodeIndex = function () {
          var index = 0, elem = element[0];
          while ((elem = elem.previousElementSibling) !== null) { ++index; }
          return index;
        };
        
        scope.setWidgetPosition = function (position) {
          widget.setPosition(position);
          scope.position = widget.getPosition();
          gridCtrl.updateWidget(widget);
          element.css(gridCtrl.getWidgetStyle(widget));
        };
        
        scope.$on('wg-finished-rendering', function () {
          element.css(gridCtrl.getWidgetStyle(widget));
        });
        
        scope.$on('$destroy', function () {
          gridCtrl.removeWidget(widget);
        });
        
        gridCtrl.addWidget(widget);
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
      
      this.columns = parseInt(options.columns) || DEFAULT_COLUMNS;
      this.rows = parseInt(options.rows) || DEFAULT_ROWS;
      this.cellSize = gridUtil.computeCellSize(this.rows, this.columns);

      this.widgets = [];
    };

    Grid.prototype.add = function (widget) {
      this.widgets.push(widget);
    };
    
    Grid.prototype.remove = function (widget) {
      var idx = this.widgets.indexOf(widget);
      if (idx >= 0) {
        this.widgets.splice(idx, 1);
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
  angular.module('widgetGrid').factory('GridRendering', [function () {
    var GridRendering = function GridRendering(grid) {
      this.grid = grid || { rows: 0, columns: 0 };
      this.positions = {};
      
      this.obstructions = [];
      for (var i = 0; i < this.grid.rows * this.grid.columns; i++) {
          this.obstructions[i] = 0;
      }
      
      this.cachedNextPosition = undefined;
    };
    
    GridRendering.prototype.rasterizeCoords = function (x, y, gridWidth, gridHeight) {
      x = Math.min(Math.max(x, 0), gridWidth - 1);
      y = Math.min(Math.max(y, 0), gridHeight - 1);
      
      return {
        i: Math.floor(y / gridHeight * this.grid.rows) + 1,
        j: Math.floor(x / gridWidth * this.grid.columns) + 1
      };
    };
    
    GridRendering.prototype.getWidgetIdAt = function (i, j) {
      for (var widgetId in this.positions) {
        var pos = this.positions[widgetId];

        if (pos.top <= i && i <= (pos.top + pos.height - 1) &&
            pos.left <= j && j <= (pos.left + pos.width - 1)) {
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
      
      this.cachedNextPosition = undefined; // possibly invalid now
    };
    
    GridRendering.prototype.hasSpaceLeft = function () {
      for (var i = 0; i < this.obstructions.length; i++) {
        if (!this.obstructions[i]) {
          return true;
        }
      }
      return false;
    };
    
    // returns the position of the largest non-obstructed rectangular area in the grid
    GridRendering.prototype.getNextPosition = function () {
      if (angular.isDefined(this.cachedNextPosition)) {
        return this.cachedNextPosition; 
      }
      
      if (!this.hasSpaceLeft()) {
        return null;
      }
      
      var maxPosition = null,
          maxArea = 0,
          currAreaLimit, currArea, currHeight, currWidth, currMaxPosition, currMaxArea, currMaxRight;
      for (var i = 1; i <= this.grid.rows; i++) {
        for (var j = 1; j <= this.grid.columns; j++) {
          if (!this._isObstructed(i, j)) {
            currAreaLimit = (this.grid.rows - i + 1) * (this.grid.columns - j + 1);
            if (currAreaLimit < maxArea) {
              break; // area can't be larger than the current max area
            }
            
            // determine the largest area that starts from the current cell
            currMaxPosition = null;
            currMaxArea = 0;
            currMaxRight = this.grid.columns;
            for (var ii = i; ii <= this.grid.rows; ii++) {
              for (var jj = j; jj <= currMaxRight; jj++) {
                if (!this._isObstructed(ii, jj)) {
                  currHeight = (ii - i + 1);
                  currWidth = (jj - j + 1);
                  currArea = currHeight * currWidth;
                  
                  if (currArea > currMaxArea) {
                    currMaxArea = currArea;
                    currMaxPosition = {
                      top: i,
                      left: j,
                      height: currHeight,
                      width: currWidth
                    };
                  }
                } else {
                  // column jj can be disregarded in the remaining local search
                  currMaxRight = jj - 1;
                }
              }
            }
            
            // compare local max w/ global max
            if (currMaxArea > maxArea) {
              maxArea = currMaxArea;
              maxPosition = currMaxPosition;
            }
          }
        }
        
        if (maxArea > (this.grid.rows - i + 1) * this.grid.columns) {
          break; // area can't be larger than the current max area
        }
      }
      
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
    GridRendering.prototype._isObstructed = function(i, j) {
      return this.obstructions[(i-1) * this.grid.columns + (j-1)] === 1;
    };
    
    // options: excludedArea, fromBottom, fromRight, expanding
    GridRendering.prototype.isAreaObstructed = function (area, options) {
      options = angular.isObject(options) ? options : {};
      
      var top = area.top,
          left = area.left,
          bottom = area.bottom || area.top + area.height - 1,
          right = area.right || area.left + area.width - 1;
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
        return { display: 'none' };
      }
      
      return {
        top: ((render.top - 1) * this.grid.cellSize.height).toString() + '%',
        height: (render.height * this.grid.cellSize.height).toString() + '%',
        left: ((render.left - 1) * this.grid.cellSize.width).toString() + '%',
        width: (render.width * this.grid.cellSize.width).toString() + '%'
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
  angular.module('widgetGrid').factory('Widget', ['gridUtil', function (gridUtil) {
    var Widget = function Widget(options) {
      this.id = gridUtil.getUID();
      
      options = options || {};

      this.width = parseInt(options.width) || null;
      this.height = parseInt(options.height) || null;
      
      this.top = parseInt(options.top) || null;
      this.left = parseInt(options.left) || null;
      
      this.style = {};
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
  angular.module('widgetGrid').service('gridRenderer', ['GridRendering', 'gridUtil', function (GridRendering, gridUtil) {
    return {
      render: function (grid, renderStrategy) {
        if (renderStrategy === 'maxSize') {
          return renderMaxSize(grid);
        }
        
        return renderClassic(grid);
      }
    };
    
    function renderMaxSize(grid) {
      var rendering = new GridRendering(grid);
      var widgets = grid && grid.widgets ? grid.widgets : [];
      
      var conflicts = [];
      
      var widget;
      for (var i = 0; i < widgets.length; i++) {
        widget = widgets[i];
        
        if (widget.top === null || widget.left === null ||
            widget.height === null || widget.width === null ||
            rendering.isAreaObstructed(widget)) {
          conflicts.push(widget);
        } else {
          rendering.setWidgetPosition(widget.id, widget);
        }
      }
      
      for (i = 0; i < conflicts.length; i++) {
        widget = conflicts[i];
        
        var nextPosition = rendering.getNextPosition();
        if (nextPosition !== null) {
          widget.setPosition(nextPosition);
          rendering.setWidgetPosition(widget.id, nextPosition);
        } else {
          widget.setPosition({ top: 0, left: 0, height: 0, width: 0 });
          rendering.setWidgetPosition(widget.id, { top: 0, left: 0, height: 0, width: 0 });
        }
      }
      
      return rendering;
    }
    
    function renderClassic(grid) {
      var rendering = new GridRendering(grid);
      
      var widgets = grid && grid.widgets ? grid.widgets : [];
      var sorted = gridUtil.sortWidgets(widgets);
      
      for (var idx = 0; idx < sorted.length; idx++) {
        var widget = sorted[idx];
        
        var position = {};
        
        // if necessary, scale the widget s.t. it fits the width of the grid
        if (widget.width > grid.columns) {
          position.width = grid.columns;
          position.height = Math.max(Math.round((position.width / widget.width) * widget.height), 1);
        } else {
          position.width = widget.width;
          position.height = widget.height;
        }
        
        // check for conflicts
        var needsRepositioning = rendering.isAreaObstructed({
          top: widget.top,
          left: widget.left,
          height: position.height,
          width: position.width
        }, { expanding: true });
        
        // resolve conflicts, if any
        if (needsRepositioning) {
          var i = 1;
          while (needsRepositioning) {
            for (var j = 1; j <= grid.columns - position.width + 1; j++) {
              needsRepositioning = rendering.isAreaObstructed({
                top: i,
                left: j,
                height: position.height,
                width: position.width
              }, { expanding: true });
              
              if (!needsRepositioning) {
                position.top = i;
                position.left = j;
                break;
              }
            }
            i++;
          }
        } else {
          position.top = widget.top;
          position.left = widget.left;
        }
        
        rendering.setWidgetPosition(widget.id, position);
      }
      
      return rendering;
    }
  }]);
})();

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
      },
      
      getPathIterator: function (endPos, startPos) {
        var topDelta = endPos.top - startPos.top;
        var leftDelta = endPos.left - startPos.left;        
        var steps = Math.max(Math.abs(topDelta), Math.abs(leftDelta));
        var currStep = 0;
        var currPos = null;
        var nextPos = { top: startPos.top, left: startPos.left };
        
        return {
          hasNext: function () {
            return nextPos !== null;
          },
          next: function () {
            currPos = nextPos;
            
            if (currStep < steps) {
              currStep++;              
              var currTopDelta = Math.round((currStep/steps) * topDelta);
              var currLeftDelta = Math.round((currStep/steps) * leftDelta);
              nextPos = {
                top: startPos.top + currTopDelta,
                left: startPos.left + currLeftDelta
              };
            } else {
              nextPos = null;
            }

            return currPos;
          }
        };
      }
    };
  }]);
})();

angular.module('widgetGrid').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('wg-grid',
    "<div ng-app=widgetGrid ng-strict-di class=wg-grid><div class=wg-grid-widgets ng-transclude></div><div wg-grid-overlay options=gridCtrl.overlayOptions rendering=gridCtrl.rendering highlight=\"gridCtrl.highlight\"></div>"
  );


  $templateCache.put('wg-movable',
    "<div wg-mover ng-show=\"editable === 'true'\" class=\"wg-widget-edit wg-widget-edit-move\"></div>"
  );


  $templateCache.put('wg-resizable',
    "<div wg-resizer ng-show=\"editable === 'true'\" class=\"wg-widget-edit wg-widget-edit-resize\"><div class=\"wg-resize wg-resize-axis wg-resize-n\"></div><div class=\"wg-resize wg-resize-axis wg-resize-e\"></div><div class=\"wg-resize wg-resize-axis wg-resize-s\"></div><div class=\"wg-resize wg-resize-axis wg-resize-w\"></div><div class=\"wg-resize wg-resize-diag wg-resize-nw\"></div><div class=\"wg-resize wg-resize-diag wg-resize-ne\"></div><div class=\"wg-resize wg-resize-diag wg-resize-se\"></div><div class=\"wg-resize wg-resize-diag wg-resize-sw\"></div></div>"
  );


  $templateCache.put('wg-widget',
    "<div class=wg-widget ng-class=\"{ editable: editable === 'true' }\"><div class=wg-widget-content ng-transclude></div></div>"
  );

}]);
