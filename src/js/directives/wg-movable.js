/// <reference path="../../../typings/angularjs/angular.d.ts"/>

(function () {
  angular.module('widgetGrid').directive('wgMovable', function (gridUtil) {
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
  });


  angular.module('widgetGrid').directive('wgMover', function ($document, gridUtil, PathIterator) {
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
  });
})();
