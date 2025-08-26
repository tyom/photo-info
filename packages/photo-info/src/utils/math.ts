/**
 * Divides a number in an array of numbers by the next item.
 * @param items - array of numbers
 * @param precision - number of decimal places to round to
 */
export const divideByNext = (items: number[], precision = 4) =>
  parseFloat(items.reduce((a, c) => a / c).toFixed(precision));
