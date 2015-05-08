/// <reference path="../../../typings/angularjs/angular.d.ts"/>

(function () {
  angular.module('widgetGrid').controller('wgResizableCtrl', ['$scope', function ($scope) {
    var self = this;
    console.log('wgResizableCtrl scope', $scope);

  }]);

  angular.module('widgetGrid').directive('wgResizable', ['gridUtil', function(gridUtil) {
    return {
      restrict: 'A',
      controller: 'wgResizableCtrl',
      controllerAs: 'resizableCtrl',
      require: 'wgWidget',
      link: {
        pre: function (scope, element, attrs, widgetCtrl) {
          var ctrl = scope.resizableCtrl;
          
          // init template
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
        var resizableCtrl = ctrls[0],
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
            
            var startPos = {
              top: widgetContainer.offsetTop,
              left: widgetContainer.offsetLeft,
              height: container.offsetHeight,
              width: container.offsetWidth
            };
            startPos.bottom = startPos.top + startPos.height - 1;
            startPos.right = startPos.left + startPos.width - 1;
            
            var delta = { top: 0, right: 0, bottom: 0, left: 0 };
            
            var draggerOffset = {
              top: event.offsetY,
              left: event.offsetX,
              bottom: event.offsetY - dragger.element[0].offsetHeight,
              right: event.offsetX - dragger.element[0].offsetWidth
            };
            
            var gridPositions = gridCtrl.getPositions();

            // TODO: make this depend on window & grid size
            var minHeight = 42, minWidth = 42;
            
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
                delta.top = Math.min(Math.max(dragPositionY - draggerOffset.top, 0), gridPositions.height - 1) - startPos.top;
                delta.top = Math.min(delta.top, startPos.height - minHeight);
              } else if (dragger.down) {
                delta.bottom = startPos.bottom - Math.min(Math.max(dragPositionY - draggerOffset.bottom, 0), gridPositions.height - 1);
                delta.bottom = Math.min(delta.bottom, startPos.height - minHeight);
              }
              
              if (dragger.left) {
                delta.left = Math.min(Math.max(dragPositionX - draggerOffset.left, 0), gridPositions.width - 1) - startPos.left; 
                delta.left = Math.min(delta.left, startPos.width - minWidth);
              } else if (dragger.right) {
                delta.right = startPos.right - Math.min(Math.max(dragPositionX - draggerOffset.right, 0), gridPositions.width - 1); 
                delta.right = Math.min(delta.right, startPos.width - minWidth);
              }
              
              containerElement.css({
                top: delta.top + 'px',
                left: delta.left + 'px',
                bottom: delta.bottom + 'px',
                right: delta.right + 'px'
              });
            }
            
            function onUp(event) {
              event.preventDefault();
              $document.off('mousemove touchmove', onMove);
              $document.off('mouseup touchend touchcancel', onUp);
              
              var start = gridCtrl.rasterizeCoords(startPos.left + delta.left, startPos.top + delta.top),
                  end = gridCtrl.rasterizeCoords(startPos.right - delta.right, startPos.bottom - delta.bottom),
                  height = end.i - start.i + 1,
                  width = end.j - start.j + 1;
              console.debug(start, end, height, width);
              
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
