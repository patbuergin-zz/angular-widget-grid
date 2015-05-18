angular.module('widgetGridDemo', ["widgetGrid"])
.controller('DemoController', function($timeout) {
  var vm = this;
  
  vm.columns = 30;
  vm.rows = 20;
  
  vm.editable = false;
  
  vm.greetingWidgets = [{
    position: { top: 1, height: 9, left: 1, width: 12 },
    text: 'Hi!'
  },{
    position: { top: 8, height: 12, left: 15, width: 13 },
    text: 'Hello!'
  },{
    position: { top: 1, height: 6, left: 21, width: 8 },
    text: 'Servus!'
  },{
    position: { top: 11, height: 6, left: 9, width: 5 },
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
      var r = Math.floor(Math.random() * 60) + 130,
          g = Math.floor(Math.random() * 60) + 130,
          b = Math.floor(Math.random() * 60) + 130;
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
