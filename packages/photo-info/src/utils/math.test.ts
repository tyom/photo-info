import { expect, test } from 'vitest';
import { divideByNext } from './math';

test('divide array items', () => {
  expect(divideByNext([10, 2, 2])).toEqual(2.5);
  expect(divideByNext([500, 5, 10])).toEqual(10);
  expect(divideByNext([5, 3])).toEqual(1.6667);
  expect(divideByNext([5, 3], 10)).toEqual(1.6666666667);
});
