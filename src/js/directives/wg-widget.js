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
          var oldPosition = widget.getPosition();
          widget.setPosition(position);
          var newPosition = widget.getPosition();
          
          if (!angular.equals(oldPosition, newPosition)) {
            gridCtrl.updateWidget(widget);
          }
          updateRendering();
        };
        
        function updateRendering() {
          element.css(gridCtrl.getWidgetStyle(widget));
          scope.position = widget.getPosition();
        }
        
        scope.$on('wg-update-rendering', updateRendering);
        
        scope.$on('$destroy', function () {
          gridCtrl.removeWidget(widget);
        });
        
        gridCtrl.addWidget(widget);
      }
    };
  }]);
})();
