(function () {
  angular.module('widgetGrid').controller('wgWidgetController', ['$scope', '$compile', 'Widget', function($scope, $compile, Widget) {
    var self = this;
    var widgetOptions = $scope.position;
    var gridCtrl;
    
    self.editable = false;
    self.widget = new Widget(widgetOptions);
    
    self.setGridCtrl = function (ctrl) {
      gridCtrl = ctrl;
    };
    
    self.innerCompile = function (element) {
      $compile(element)($scope);
    };
    
    self.setPosition = function (position) {
      self.widget.top = position.top || self.widget.top;
      self.widget.left = position.left || self.widget.left;
      self.widget.height = position.height || self.widget.height;
      self.widget.width = position.width || self.widget.width;
      
      console.log('set widget position', self.widget, position);
      
      gridCtrl.updateRendering();
    };
  }]);
  
  angular.module('widgetGrid').directive('wgWidget', widgetDirective);
  function widgetDirective() {
    return {
      scope: {
        position: '=position'
      },
      restrict: 'E',
      controller: 'wgWidgetController',
      controllerAs: 'widgetCtrl',
      require: '^wgGrid',
      transclude: true,
      replace: true,
      templateUrl: 'wg-widget',
      link: {
        post: function (scope, element, attrs, gridCtrl) {
          var widgetCtrl = scope.widgetCtrl;
          
          gridCtrl.addWidget(scope.widgetCtrl.widget);
          widgetCtrl.setGridCtrl(gridCtrl);
          
          attrs.$observe('editable', function (newVal) {
            scope.widgetCtrl.editable = newVal === 'true';
          });
        }
      }
    };
  }
})();
