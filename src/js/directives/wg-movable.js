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
  });
})();
