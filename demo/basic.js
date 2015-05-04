angular.module('widgetGridDemo', ["widgetGrid"])
.controller('DemoController', function($timeout) {
  var vm = this;
  
  vm.columns = 12;
  vm.rows = 8;
  
  vm.widgets = [{
    position: { top: 0, height: 4, left: 0, width: 5 },
    style: { backgroundColor: '#981254' }
  },{
    position: { top: 4, height: 4, left: 5, width: 7 },
    style: { backgroundColor: '#ef4512' }
  },{
    position: { top: 7, height: 1, left: 2, width: 3 },
    style: { backgroundColor: '#cc7721' }
  },{
    position: { top: 0, height: 2, left: 6, width: 3 },
    style: { backgroundColor: '#c420c4' }
  }];
  
  function updateGridSize() {
    $timeout(function () {
      var grid = document.getElementById('demo-grid');
      vm.gridWidth = grid.clientWidth;
      vm.gridHeight = grid.clientHeight;
    });
  }
  updateGridSize();
  window.onresize = updateGridSize;
});