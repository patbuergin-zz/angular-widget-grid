(function () {
  angular.module('widgetGrid').directive('wgResizable', resizableDirective);
  function resizableDirective() {
    return {
      scope: {
        position: '=position'
      },
      restrict: 'A',
      require: '^wgGrid',
      templateUrl: 'wg-resizable'
    };
  }
})();