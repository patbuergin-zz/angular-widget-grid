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
    
    it('rounds to four decimal places when applicable', function () {
      expect(gridUtil.computeCellSize(3, 7)).toEqual({ height: 33.3333, width: 14.2857 });
      expect(gridUtil.computeCellSize(11, 33)).toEqual({ height: 9.0909, width: 3.0303 });
    });
  });
  
  describe('#getUID', function () {
    it('returns increasing integers as string, starting from 1', function () {
      expect(gridUtil.getUID()).toEqual("1");
      expect(gridUtil.getUID()).toEqual("2");
      expect(gridUtil.getUID()).toEqual("3");
    });
  });
  
  describe('#getPathIterator', function () {
    describe('iterator', function () {
      it('yields exactly one value if startPos equals endPos', function () {
        var endPos = { top: 4, left: 9 };
        var startPos = { top: 4, left: 9 };
        var iter = gridUtil.getPathIterator(endPos, startPos);
        
        expect(iter.hasNext()).toBe(true);
        var next = iter.next();
        expect(next).toEqual(endPos);
        expect(iter.hasNext()).toBe(false);
        next = iter.next();
        expect(next).toBeNull();
      });
      
      it('yields a linear path from startPos to endPos when passed positions that share a coordinate', function () {
        var endPos = { top: 4, left: 9 };
        var startPos = { top: 4, left: 12 };
        var iter = gridUtil.getPathIterator(endPos, startPos);
        expect(iter.hasNext()).toBe(true);
        expect(iter.next()).toEqual({ top: 4, left: 12 });
        expect(iter.next()).toEqual({ top: 4, left: 11 });
        expect(iter.next()).toEqual({ top: 4, left: 10 });
        expect(iter.next()).toEqual({ top: 4, left: 9 });
        expect(iter.next()).toBeNull();

        startPos = { top: 4, left: 8 };
        iter = gridUtil.getPathIterator(endPos, startPos);
        expect(iter.next()).toEqual({ top: 4, left: 8 });
        expect(iter.next()).toEqual({ top: 4, left: 9 });
        expect(iter.next()).toBeNull();

        startPos = { top: 6, left: 9 };
        iter = gridUtil.getPathIterator(endPos, startPos);
        expect(iter.next()).toEqual({ top: 6, left: 9 });
        expect(iter.next()).toEqual({ top: 5, left: 9 });
        expect(iter.next()).toEqual({ top: 4, left: 9 });
        expect(iter.next()).toBeNull();
        
        startPos = { top: 2, left: 9 };
        iter = gridUtil.getPathIterator(endPos, startPos);
        expect(iter.next()).toEqual({ top: 2, left: 9 });
        expect(iter.next()).toEqual({ top: 3, left: 9 });
        expect(iter.next()).toEqual({ top: 4, left: 9 });
        expect(iter.next()).toBeNull();
      });
      
      it('yields diagonal paths if necessary', function () {
        var endPos = { top: 4, left: 9 };
        var startPos = { top: 7, left: 12 };
        var iter = gridUtil.getPathIterator(endPos, startPos);
        expect(iter.hasNext()).toBe(true);
        expect(iter.next()).toEqual({ top: 7, left: 12 });
        expect(iter.next()).toEqual({ top: 6, left: 11 });
        expect(iter.next()).toEqual({ top: 5, left: 10 });
        expect(iter.next()).toEqual({ top: 4, left: 9 });
        expect(iter.next()).toBeNull();

        startPos = { top: 9, left: 8 };
        iter = gridUtil.getPathIterator(endPos, startPos);
        expect(iter.next()).toEqual({ top: 9, left: 8 });
        expect(iter.next()).toEqual({ top: 8, left: 8 });
        expect(iter.next()).toEqual({ top: 7, left: 8 });
        expect(iter.next()).toEqual({ top: 6, left: 9 });
        expect(iter.next()).toEqual({ top: 5, left: 9 });
        expect(iter.next()).toEqual({ top: 4, left: 9 });
        expect(iter.next()).toBeNull();

        startPos = { top: 3, left: 6 };
        iter = gridUtil.getPathIterator(endPos, startPos);
        expect(iter.next()).toEqual({ top: 3, left: 6 });
        expect(iter.next()).toEqual({ top: 3, left: 7 });
        expect(iter.next()).toEqual({ top: 4, left: 8 });
        expect(iter.next()).toEqual({ top: 4, left: 9 });
        expect(iter.next()).toBeNull();
        
        startPos = { top: 1, left: 10 };
        iter = gridUtil.getPathIterator(endPos, startPos);
        expect(iter.next()).toEqual({ top: 1, left: 10 });
        expect(iter.next()).toEqual({ top: 2, left: 10 });
        expect(iter.next()).toEqual({ top: 3, left: 9 });
        expect(iter.next()).toEqual({ top: 4, left: 9 });
        expect(iter.next()).toBeNull();
      });
    });
  });
});
