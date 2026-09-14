export const dates = ['2026-06-10','2026-06-11','2026-06-12','2026-06-13','2026-06-14'];
const points = values => values.map((value,i)=>({time:dates[i],value}));
// Values readable in the supplied references are retained; other values are illustrative.
export const demoData = {
  area: points([2.04,29.4,44.36,55.65,64]),
  spline: points([610.78,185,161.47,56.33,355]),
  line: points([3,32,36,70,95]),
  bar: points([0.68,0.92,1.23,0.79,0.81]),
};
