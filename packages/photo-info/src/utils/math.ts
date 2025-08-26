/**
 * Divides a number in an array of numbers by the next item.
 * @param items - array of numbers
 * @param precision - number of decimal places to round to
 */
export const divideByNext = (items: number[], precision = 4) => {
  if (!Array.isArray(items) || items.length === 0) {
    return 0;
  }
  return parseFloat(items.reduce((a, c) => a / c).toFixed(precision));
};
