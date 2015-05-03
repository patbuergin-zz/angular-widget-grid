/// <reference path="../../typings/jasmine/jasmine.d.ts"/>
/* global inject */

describe('gridRenderer', function () {
  beforeEach(module('widgetGrid'));
  
  var gridRenderer;
  
  beforeEach(inject(function (_gridRenderer_) {
    gridRenderer = _gridRenderer_;
  }));
  
  describe('#render', function () {
    xit('returns an empty GridRendering when passed an empty/no grid', function () {
    
    });
    
    xit('adopts the original positioning if there are no conflicts', function () {
      
    });
    
    xit('can deal with overlapping widgets', function () {
      
    });
    
    xit('extends the effective grid vertically, if necessary', function () {
      
    });
    
    xit('does not change the passed grid object', function () {
      
    });
    
    xit('evenly scales widgets whose width exceeds the width of the grid', function () {
      
    });
    
    xit('prioritizes rows over columns when scanning for a free slot', function () {
      
    });
  });
});
