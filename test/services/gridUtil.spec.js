/// <reference path="../../typings/jasmine/jasmine.d.ts"/>
/* global inject */

describe('gridUtil', function () {
  beforeEach(module('widgetGrid'));
  
  var gridUtil;
  
  beforeEach(inject(function (_gridUtil_) {
    gridUtil = _gridUtil_;
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
  
  describe('#computeCellSize', function () {
    it('returns a size of 0 when the respective dimension is 0 or undefined', function () {
      expect(gridUtil.computeCellSize(0, 0)).toEqual({ height: 0, width: 0 });
      expect(gridUtil.computeCellSize()).toEqual({ height: 0, width: 0 });
      expect(gridUtil.computeCellSize(5, 0)).toEqual({ height: 20, width: 0 });
      expect(gridUtil.computeCellSize(0, 5)).toEqual({ height: 0, width: 20 });
    });
    
    it('returns valid integer sizes when passed suitable dimensions', function () {
      expect(gridUtil.computeCellSize(1, 1)).toEqual({ height: 100, width: 100 });
      expect(gridUtil.computeCellSize(4, 2)).toEqual({ height: 25, width: 50 });
      expect(gridUtil.computeCellSize(50, 100)).toEqual({ height: 2, width: 1 });
    });
    
    it('rounds to two decimal places when applicable', function () {
      expect(gridUtil.computeCellSize(3, 7)).toEqual({ height: 33.33, width: 14.29 });
      expect(gridUtil.computeCellSize(11, 33)).toEqual({ height: 9.09, width: 3.03 });
    });
  });
  
  describe('#getUID', function () {
    it('returns increasing integers as string, starting from 1', function () {
      expect(gridUtil.getUID()).toEqual("1");
      expect(gridUtil.getUID()).toEqual("2");
      expect(gridUtil.getUID()).toEqual("3");
    });
  });
});
