/**
 * @license angular-widget-grid v0.1.6
 * (c) 2015 Patrick Buergin
 * License: MIT
 * https://github.com/patbuergin/angular-widget-grid
 */
(function () {
  angular.module('widgetGrid', []);
})();

(function () {
  angular.module('widgetGrid').directive('wgGridPreview', function () {
    return {
      scope: {
        'rendering': '=',
        'highlight': '=?'
      },
      restrict: 'AE',
      replace: true,
      template: '<svg xmlns="http://www.w3.org/2000/svg" class="wg-grid-overlay"></svg>',
      link: function (scope, element) {
        var XMLNS = 'http://www.w3.org/2000/svg',
            COLOR_DEFAULT = 'rgb(242, 242, 242)',
            COLOR_HIGHLIGHT = 'rgba(0, 113, 188, 0.2)',
            COLOR_STROKE = 'rgba(255, 255, 255, 1)';
        var highlightedCells = [];
        
        scope.$watch('rendering', function (newVal) {
          if (newVal) {
            update(newVal);
          }
        });
        
        scope.$watch('highlight', function (newVal, oldVal) {
          if (!angular.equals(newVal, oldVal)) {
            if (highlightedCells.length > 0) {
              resetHighlights(highlightedCells);
            }
            if (newVal) {
              highlightArea(scope.rendering, newVal);
            }
          }
        });
        
        function update(rendering) {
          element.children().remove();
          
          var cellHeight = rendering.grid.cellSize.height,
              cellWidth = rendering.grid.cellSize.width,
              height = cellHeight + '%',
              width = cellWidth + '%';
          
          for (var i = 0; i < rendering.grid.rows; i++) {
            for (var j = 0; j < rendering.grid.columns; j++) {
              var rect = document.createElementNS(XMLNS, 'rect');
              var x = (j * cellWidth) + '%',
                  y = (i * cellHeight) + '%';
              
              rect.setAttributeNS(null, 'x', x);
              rect.setAttributeNS(null, 'y', y);
              rect.setAttributeNS(null, 'width', width);
              rect.setAttributeNS(null, 'height', height);
              rect.setAttributeNS(null, 'fill', COLOR_DEFAULT);
              rect.setAttributeNS(null, 'stroke', COLOR_STROKE);
              rect.setAttributeNS(null, 'stroke-width', '1');
              
              element.append(rect);
            }
          }
        }
        
        function resetHighlights(highlightedCells) {
          var cells = element.children();
          for (var idx = 0; idx < highlightedCells.length; idx++) {
            var cell = cells[highlightedCells[idx]];
            cell.setAttribute('fill', COLOR_DEFAULT);
          }
          highlightedCells = [];
        }
        
        function highlightArea(rendering, area) {
          var cells = element.children();
          var top = Math.max(area.top, 1),
              bottom = Math.min(top + area.height - 1, rendering.grid.rows),
              left = Math.max(area.left, 1),
              right = Math.min(area.left + area.width - 1, rendering.grid.columns);
          
          for (var i = top; i <= bottom; i++) {
            for (var j = left; j <= right; j++) {
              var idx = (i-1) * rendering.grid.columns + (j-1);
              var cell = cells[idx];
              cell.setAttribute('fill', COLOR_HIGHLIGHT);
              highlightedCells.push(idx);
            }
          }
        }
      }
    };
  });
})();

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

(function () {
  angular.module('widgetGrid').directive('wgMovable', ['gridUtil', function(gridUtil) {
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
          startPos.top = scope.widget.top;
          startPos.left = scope.widget.left;
          startPos.height = scope.widget.height;
          startPos.width = scope.widget.width;
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
            
            var areaObstructed = gridCtrl.isAreaObstructed(targetArea, startPos, movedDown, movedRight);
            if (!areaObstructed) {
              return targetArea;
            }
          }
        }
      }
    };
  }]);
})();

(function () {
  angular.module('widgetGrid').directive('wgResizable', ['gridUtil', function(gridUtil) {
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
  
  angular.module('widgetGrid').directive('wgWidget', ['$compile', 'Widget', function ($compile, Widget) {
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
        
        scope.$on('rendering-finished', function () {
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
    var GridRendering = function GridRendering(grid, positions) {
      this.grid = grid || { widgets: [] };
      this.positions = positions || {};
    };
    
    GridRendering.prototype.rasterizeCoords = function (x, y, gridWidth, gridHeight) {
      x = Math.min(Math.max(x, 0), gridWidth - 1);
      y = Math.min(Math.max(y, 0), gridHeight - 1);
      
      return {
        i: Math.floor((this.grid.rows / gridHeight) * y) + 1,
        j: Math.floor((this.grid.columns / gridWidth) * x) + 1
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
    
    GridRendering.prototype.updateWidget = function (widget) {
      var position = this.positions[widget.id];
      position.top = widget.top || position.top;
      position.left = widget.left || position.left;
      position.height = widget.height || position.height;
      position.width = widget.width || position.width;
    };
  
    GridRendering.prototype.isObstructed = function (i, j, excludedArea, expanding) {
      // fail if (i, j) exceeds the grid's non-expanding boundaries
      if (i < 1 || j < 1 || j > this.grid.columns) {
        return true;
      }
      
      if (!expanding && i > this.grid.rows) {
        return true;
      }
      
      // pass if (i, j) is within the excluded area, if any
      if (excludedArea && excludedArea.top <= i && i <= excludedArea.bottom &&
          excludedArea.left <= j && j <= excludedArea.right) {
        return false;
      }
      return this.getWidgetIdAt(i, j) !== null;
    };
    
    GridRendering.prototype.isAreaObstructed = function (area, excludedArea, fromBottom, fromRight, expanding) {
      var top = area.top,
          left = area.left,
          bottom = area.bottom || area.top + area.height - 1,
          right = area.right || area.left + area.width - 1;
      var verticalStart = fromBottom ? bottom : top,
          verticalStep = fromBottom ? -1 : 1,
          verticalEnd = (fromBottom ? top : bottom) + verticalStep;
      var horizontalStart = fromRight ? right : left,
          horizontalStep = fromRight ? -1 : 1,
          horizontalEnd = (fromRight ? left: right) + horizontalStep;
      
      for (var i = verticalStart; i !== verticalEnd; i += verticalStep) {
        for (var j = horizontalStart; j !== horizontalEnd; j += horizontalStep) {
          if (this.isObstructed(i, j, excludedArea, expanding)) {
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
    
    return GridRendering;
  }]);
})();

(function () {
  var DEFAULT_WIDTH = 1,
      DEFAULT_HEIGHT = 1,
      DEFAULT_TOP = 0,
      DEFAULT_LEFT = 0;
  
  angular.module('widgetGrid').factory('Widget', ['gridUtil', function (gridUtil) {
    var Widget = function Widget(options) {
      this.id = gridUtil.getUID();
      
      options = options || {};
      
      this.width = parseInt(options.width) || DEFAULT_WIDTH;
      this.height = parseInt(options.height) || DEFAULT_HEIGHT;
      
      this.top = parseInt(options.top) || DEFAULT_TOP;
      this.left = parseInt(options.left) || DEFAULT_LEFT;
      
      this.style = {};
    };
    
    Widget.prototype.setPosition = function (position) {
      this.top = position.top || this.top;
      this.left = position.left || this.left;
      this.height = position.bottom - position.top + 1 || position.height || this.height;
      this.width = position.right - position.left + 1 || position.width || this.width;
    };
    
    Widget.prototype.getPosition = function () {
      return {
        top: this.top,
        left: this.left,
        bottom: this.top + this.height - 1,
        right: this.left + this.width - 1
      };
    };
    
    return Widget;
  }]);
})();

(function () {
  angular.module('widgetGrid').service('gridRenderer', ['GridRendering', 'gridUtil', function (GridRendering, gridUtil) {
    return {
      render: function (grid) {
        // naive impl; lots of room for performance improvements
        
        var rendering = new GridRendering(grid, {});
        
        var widgets = grid && grid.widgets ? grid.widgets : [];
        var sorted = gridUtil.sortWidgets(widgets);
        
        for (var idx = 0; idx < sorted.length; idx++) {
          var widget = sorted[idx];
          
          var position = {};
          
          // scale evenly to fit the width of the grid
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
          }, null, null, null, true);
          
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
                }, null, null, null, true);
                
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
          
          rendering.positions[widget.id] = position;
        }
        
        return rendering;
      }
    };
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
    "<div ng-app=widgetGrid ng-strict-di class=wg-grid><div class=wg-grid-widgets ng-transclude></div><wg-grid-preview ng-if=\"showGrid === 'true'\" rendering=gridCtrl.rendering highlight=\"gridCtrl.highlight\"></div>"
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
