angular.module('widgetGridDemo', ["widgetGrid"])
.controller('DemoController', function($timeout) {
  var vm = this;
  
  vm.columns = 60;
  vm.rows = 40;
  
  vm.editable = false;
  
  vm.greetingWidgets = [{
    position: { top: 1, height: 18, left: 1, width: 25 },
    text: 'Hi!'
  },{
    position: { top: 16, height: 25, left: 28, width: 29 },
    text: 'Hello!'
  },{
    position: { top: 1, height: 12, left: 40, width: 19 },
    text: 'Servus!'
  },{
    position: { top: 20, height: 12, left: 17, width: 10 },
    text: 'Salut!'
  }];
  
  updateGridSize();
  window.onresize = updateGridSize;
  
  function updateGridSize() {
    $timeout(function () {
      var grid = document.getElementById('demo-grid');
      vm.gridWidth = grid.clientWidth;
      vm.gridHeight = grid.clientHeight;
    });
  }
})
.directive('randomBgColor', function () {
  return {
    link: function (scope, element) {
      var r = Math.floor(Math.random() * 100) + 80,
          g = Math.floor(Math.random() * 100) + 80,
          b = Math.floor(Math.random() * 100) + 80;
      var bgColor = 'rgb(' + r + ',' + g + ',' + b + ')'; 
      element.css('background-color', bgColor);
    }
  };
})
.directive('youtube', function () {
  return {
    scope: { id: '@' },
    template: '<iframe frameborder="0" height="100%" width="100%" src="{{src}}"></iframe>',
    link: function (scope) {
      scope.src = 'https://youtube.com/embed/' + scope.id + '?autoplay=0&controls=1&showinfo=0&autohide=1';
    }
  }
})
.config(function($sceDelegateProvider) {
  $sceDelegateProvider.resourceUrlWhitelist([
    'self', 'https://youtube.com/**'
  ]);
});
