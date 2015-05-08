/// <reference path="../../../typings/angularjs/angular.d.ts"/>

(function () {
  angular.module('widgetGrid').controller('wgResizableCtrl', ['$scope', function () {

  }]);

  angular.module('widgetGrid').directive('wgResizable', ['gridUtil', function(gridUtil) {
    return {
      restrict: 'A',
      controller: 'wgResizableCtrl',
      require: 'wgWidget',
      link: {
        pre: function (scope, element, attrs, widgetCtrl) {
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
  
  angular.module('widgetGrid').directive('wgResizer', ['$document', function ($document) {
    return {
      restrict: 'A',
      require: ['^wgResizable', '^wgGrid'],
      link: function (scope, element, attrs, ctrls) {
        var wgResizableCtrl = ctrls[0],
            gridCtrl = ctrls[1];
        
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
            
            var startHeight = container.clientHeight,
                startWidth = container.clientWidth,
                startTop = widgetContainer.offsetTop,
                startLeft = widgetContainer.offsetLeft,
                startBottom = startTop + startHeight,
                startRight = startLeft + startWidth;
                
            var gridPositions = gridCtrl.getPositions();

            // TODO: make this depend on window & grid size
            var minHeight = 42, minWidth = 42;
            
            $document.on('mousemove touchmove', onMove);
            $document.on('mouseup touchend touchcancel', onUp);
            
            function onMove(event) {
              console.log(event);
              event.preventDefault();
              
              if (event.touches) {
                event.clientX = event.touches[0].clientX;
                event.clientY = event.touches[0].clientY;
              }
              
              // normalize the drag position
              var dragPositionX = Math.min(Math.max(event.clientX - gridPositions.left, 0), gridPositions.width),
                  dragPositionY = Math.min(Math.max(event.clientY - gridPositions.top, 0), gridPositions.height);

              if (dragger.up) {
                var topDelta = dragPositionY - startTop;
                var newTop = Math.min(topDelta, startHeight - minHeight);
                containerElement.css({ top: newTop + 'px' });
              } else if (dragger.down) {
                var bottomDelta = startBottom - dragPositionY;
                var newBottom = Math.min(bottomDelta, startHeight - minHeight);
                containerElement.css({ bottom: newBottom + 'px' });
              }
              
              if (dragger.left) {
                var leftDelta = dragPositionX - startLeft; 
                var newLeft = Math.min(leftDelta, startWidth - minWidth);
                containerElement.css({ left: newLeft + 'px' });
              } else if (dragger.right) {
                var rightDelta = startRight - dragPositionX; 
                var newRight = Math.min(rightDelta, startWidth - minWidth);
                containerElement.css({ right: newRight + 'px' });
              }
            }
            
            function onUp(event) {
              event.preventDefault();
              $document.off('mousemove touchmove', onMove);
              $document.off('mouseup touchend touchcancel', onUp);
              
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
