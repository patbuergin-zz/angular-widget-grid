/// <reference path="../../../typings/angularjs/angular.d.ts"/>

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
        
        for (var i = 0; i < draggers.length; i++) {
          registerDragHandler(draggers[i], element);
        }
         
        function registerDragHandler(dragger, containerElement) {
          dragger.element.on('mousedown touchstart', onDown);
          
          function onDown(event) {
            event.preventDefault();

            dragger.element.addClass('dragging');
            
            var container = containerElement[0],
                widgetContainer = container.parentElement;
            
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
            
            $document.on('mousemove touchmove', onMove);
            $document.on('mouseup touchend touchcancel', onUp);
            
            function onMove(event) {
              event.preventDefault();
              
              if (event.touches) {
                event.clientX = event.touches[0].clientX;
                event.clientY = event.touches[0].clientY;
              }
              
              // normalize the drag position
              var dragPositionX = event.clientX - gridPositions.left,
                  dragPositionY = event.clientY - gridPositions.top;
              
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
              
              containerElement.css({
                top: delta.top + 'px',
                left: delta.left + 'px',
                bottom: delta.bottom + 'px',
                right: delta.right + 'px'
              });
              
              // TODO: preview
            }
            
            function onUp(event) {
              event.preventDefault();
              $document.off('mousemove touchmove', onMove);
              $document.off('mouseup touchend touchcancel', onUp);
              
              var requestedStartPoint = gridCtrl.rasterizeCoords(startRender.left + delta.left, startRender.top + delta.top),
                  requestedEndPoint = gridCtrl.rasterizeCoords(startRender.right - delta.right, startRender.bottom - delta.bottom);

              var requestedPos = {
                top: requestedStartPoint.i,
                right: requestedEndPoint.j,
                bottom: requestedEndPoint.i,
                left: requestedStartPoint.j
              };
              
              var finalPos = {};
              
              
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

              scope.setWidgetPosition(finalPos);
              
              // reset style
              dragger.element.removeClass('dragging');
              containerElement.removeAttr('style');
            }
          }
        }
      }
    };
  }]);
})();
