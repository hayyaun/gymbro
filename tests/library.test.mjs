import assert from "node:assert/strict";
import test from "node:test";
import { linkStudents, updateStudent, makeStudent, isDate, insertBlockExercises } from "../src/library.ts";

test("legacy plans gain one stable profile per normalized name without losing workouts", () => {
  const days = [{ id: "session", exercises: [{ name: "اسکوات", sets: "4" }] }];
  const original = [{ id: "one", athlete: "علي  كريمي", days }, { id: "two", athlete: "علی کریمی", days }];
  const linked = linkStudents(original, []);
  assert.equal(linked.students.length, 1);
  assert.equal(linked.plans[0].studentId, linked.plans[1].studentId);
  assert.deepEqual(linked.plans[0].days, days);
  assert.deepEqual(original[0].athlete, "علي  كريمي");
  assert.deepEqual(linkStudents(linked.plans, linked.students), linked);
});
test("renaming a profile updates linked programs and retains payments and other students", () => {
  const payment = { id: "payment", amount: 2500000, date: "2026-11-04", method: "card", period: "آبان", note: "" };
  const student = { ...makeStudent("علی", "student"), payments: [payment] };
  const other = makeStudent("علی", "other-student");
  const plans = [{ id: "a", studentId: student.id, athlete: "علی" }, { id: "b", studentId: other.id, athlete: "علی" }];
  const result = updateStudent(plans, [student, other], { ...student, name: "علی کریمی" });
  assert.equal(result.plans[0].athlete, "علی کریمی");
  assert.equal(result.plans[1].athlete, "علی");
  assert.deepEqual(result.students[0].payments, [payment]);
  assert.equal(linkStudents(result.plans, result.students).students.length, 2);
});
test("payment dates reject impossible calendar dates", () => {
  assert.equal(isDate("2026-02-30"), false);
  assert.equal(isDate("2024-02-29"), true);
  assert.equal(isDate("bad"), false);
});
test("reusing blocks creates independent movement IDs and keeps supersets separate", () => {
  const existing = [{ id: "original", name: "پرس سینه", group: "A", note: "یادداشت", sets: "3", reps: "8", rest: "90" }];
  const incoming = [{ ...existing[0], id: "block-one", name: "جلو بازو" }, { ...existing[0], id: "block-two", name: "پشت بازو" }];
  const result = insertBlockExercises(existing, incoming);
  assert.equal(result[0], existing[0]);
  assert.equal(result[1].group, result[2].group);
  assert.notEqual(result[1].group, existing[0].group);
  assert.equal(new Set(result.map((item) => item.id)).size, 3);
  assert.notEqual(result[1].id, incoming[0].id);
  result[1].note = "تغییر";
  assert.equal(incoming[0].note, "یادداشت");
});
