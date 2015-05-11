angular.module('widgetGridDemo', ["widgetGrid"])
.controller('DemoController', function($timeout, $sce) {
  var vm = this;
  
  vm.columns = 24;
  vm.rows = 16;
  
  vm.editable = false;
  
  vm.widgets = [{
    position: { top: 1, height: 7, left: 1, width: 9 },
    inner: $sce.trustAsHtml(
      '<div class="demo-widget-container" style="background-color: #981254;">' +
        '<h1 class="demo-widget-title">TODO</h1>' + 
      '</div>'
    )
  },{
    position: { top: 8, height: 9, left: 10, width: 15 },
    inner: $sce.trustAsHtml(
      '<div class="demo-widget-container" style="overflow: hidden">' +
       '<iframe frameborder="0" height="100%" width="100%" ' +
         'src="https://youtube.com/embed/V9tmsIbi4Kw?autoplay=0&controls=0&showinfo=0&autohide=1">' +
       '</iframe>' +
      '</div>'
    )
  },{
    position: { top: 1, height: 6, left: 20, width: 5 },
    inner: $sce.trustAsHtml(
      '<div class="demo-widget-container" style="background-color: #7C0BA5;">' +
        '<h1 class="demo-widget-title">Hi</h1>' + 
      '</div>'
    )
  },{
    position: { top: 11, height: 4, left: 5, width: 4 },
    inner: $sce.trustAsHtml(
      '<div class="demo-widget-container" style="background-color: #A5220B;">' +
        '<h1 class="demo-widget-title">Hi</h1>' +
      '</div>'
    )
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
