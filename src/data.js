export const dates = [
  "2026-06-10",
  "2026-06-11",
  "2026-06-12",
  "2026-06-13",
  "2026-06-14",
];
const points = (values) =>
  values.map((value, i) => ({ time: dates[i], value }));
// Five dates transcribed from the supplied video.
export const demoData = {
  area: points([2.04, 25.85, 44.36, 55.65, 63.75]),
  spline: points([610.78, 180.5, 161.47, 56.33, 357.25]),
  line: points([3, 30, 36, 70, 90]),
  bar: points([0.68, 0.86, 1.23, 0.79, 0.71]),
};
