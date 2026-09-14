import { test } from "node:test";
import assert from "node:assert/strict";
import { normalize, segments, splinePath } from "./src/model.js";
const empty = () => ({ area: [], bar: [], spline: [], line: [] });
test("sorts dates, preserves zero and null", () => {
  const d = empty();
  d.area = [
    { time: "2026-06-12", value: null },
    { time: "2026-06-10", value: 0 },
  ];
  assert.deepEqual(
    normalize(d).area.map((p) => p.value),
    [0, null],
  );
});
test("rejects duplicates, invalid dates and nonfinite values", () => {
  for (const points of [
    [{ time: "bad", value: 1 }],
    [{ time: 0, value: Infinity }],
    [
      { time: 0, value: 1 },
      { time: 0, value: 2 },
    ],
  ])
    assert.throws(() => normalize({ ...empty(), area: points }));
});
test("nulls break paths rather than bridge missing samples", () =>
  assert.equal(
    segments([{ value: 1 }, { value: null }, { value: 2 }]).length,
    2,
  ));
test("spline passes through observations", () => {
  const d = splinePath([
    { x: 0, y: 0 },
    { x: 10, y: 20 },
    { x: 20, y: 0 },
  ]);
  assert.match(d, /10 20/);
  assert.ok(d.endsWith("20 0"));
});

import { tooltipPosition } from "./src/model.js";
import { demoData } from "./src/data.js";
test("last date matches values visible in the video", () =>
  assert.deepEqual(
    Object.fromEntries(
      Object.entries(demoData).map(([key, points]) => [
        key,
        points.at(-1).value,
      ]),
    ),
    { area: 63.75, spline: 357.25, line: 90, bar: 0.71 },
  ));
test("tooltip moves vertically with pointer on same date", () => {
  assert.deepEqual(tooltipPosition(534, 155, 334, 178, 590, 294), {
    left: 170,
    top: 66,
  });
  assert.equal(tooltipPosition(534, 175, 334, 178, 590, 294).top, 86);
});
test("tooltip flips sides and remains inside plot", () => {
  assert.equal(tooltipPosition(59, 70, 334, 178, 590, 294).left, 89);
  assert.deepEqual(tooltipPosition(295, 175, 334, 178, 590, 294), {
    left: 0,
    top: 0,
  });
});
