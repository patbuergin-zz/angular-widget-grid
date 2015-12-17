/// <reference path="../../typings/jasmine/jasmine.d.ts"/>
/* global inject */

describe('gridUtil', function () {
  beforeEach(module('widgetGrid'));
  
  var gridUtil, CellSize;
  
  beforeEach(inject(function (_gridUtil_, _CellSize_) {
    gridUtil = _gridUtil_;
    CellSize = _CellSize_;
  }));
  
  describe('#sortWidgets', function () {
    it('prioritizes lower row positions over lower column positions', function () {
      var w1 = { top: 3, left: 2 };
      var w2 = { top: 2, left: 3 };
      var widgets = [w1, w2];
      var sorted = gridUtil.sortWidgets(widgets);
      expect(sorted).toEqual([w2, w1]);
    });
    
    it('considers column positions when row positions are equal', function () {
      var w1 = { top: 3, left: 5 };
      var w2 = { top: 2, left: 3 };
      var w3 = { top: 3, left: 3 };
      var widgets = [w1, w2, w3];
      var sorted = gridUtil.sortWidgets(widgets);
      expect(sorted).toEqual([w2, w3, w1]);
    });
  });
});
