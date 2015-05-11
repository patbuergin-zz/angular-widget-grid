/// <reference path="../../../typings/angularjs/angular.d.ts"/>

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
        element.on('mousedown touchstart', onDown);
        
        function onDown(event) {
          event.preventDefault();
         
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
          
          event.offsetX = event.offsetX || event.layerX;
          event.offsetY = event.offsetY || event.layerY;
          
          var requestedPos = { top: 0, left: 0 };
          
          var moverOffset = {
            top: event.offsetY,
            left: event.offsetX
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
            
            requestedPos.top = Math.min(Math.max(dragPositionY - moverOffset.top, 0), gridPositions.height - 1);
            requestedPos.left = Math.min(Math.max(dragPositionX - moverOffset.left, 0), gridPositions.width - 1); 

            widgetElement.css({
              top: requestedPos.top + 'px',
              left: requestedPos.left + 'px'
            });
            // TODO: preview
          }
          
          function onUp(event) {
            event.preventDefault();
            $document.off('mousemove touchmove', onMove);
            $document.off('mouseup touchend touchcancel', onUp);

            // find a suitable final position
            var requestedStartPoint = gridCtrl.rasterizeCoords(requestedPos.left, requestedPos.top);
            var finalPosRequest = { top: requestedStartPoint.i, left: requestedStartPoint.j },
                finalPos;
            var movedDown = finalPosRequest.top >= startPos.top,
                movedRight = finalPosRequest.left >= startPos.left;
            var path = gridUtil.getPathIterator(startPos, finalPosRequest);
            
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
                finalPos = currPos;
                break;
              }
            }

            widgetElement.removeClass('wg-moving');
            scope.setWidgetPosition(finalPos);
          }
        }
      }
    };
  }]);
})();
