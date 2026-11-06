import assert from "node:assert/strict";
import test from "node:test";
import { makeBackup, parseBackup, restoreData } from "../src/backup.ts";
import { makeStudent } from "../src/library.ts";

const date = "2026-11-04T12:00:00.000Z";
const payment = (id, amount = 2500000) => ({ id, amount, date: "2026-11-04", period: "آبان", method: "card", note: "شماره پیگیری" });
function fixture() {
  const exercises = [{ id: "movement", name: "اسکوات", sets: "3", reps: "8–10", rest: "90", group: "A", note: "توضیح" }];
  const student = { ...makeStudent("آرمان", "student"), payments: [payment("receipt")], notes: "یادداشت خصوصی", equipment: "دمبل" };
  const plan = { id: "program", studentId: student.id, athlete: student.name, title: "دوره قدرت", goal: "افزایش قدرت", weeks: "6", template: "forge", color: "#dc3045", forgeAccent: "purple", forgeMode: "light", notes: "یادداشت برنامه", cardio: "هوازی", days: [{ id: "day", name: "روز اول", focus: "پا", exercises }], schedule: ["روز اول", ...Array(6).fill("استراحت")], updatedAt: date };
  return { coach: "مربی", heroDismissed: true, plans: [plan], students: [student], blocks: [{ id: "block", name: "پا", focus: "پا", exercises, updatedAt: date }] };
}
test("a JSON backup round trip retains programs, palettes, private notes, payments and blocks", () => {
  const data = fixture();
  const snapshot = makeBackup({ ...data, action: () => {} });
  assert.equal("action" in snapshot.data, false);
  assert.deepEqual(parseBackup(JSON.stringify(snapshot)).data, data);
});
test("invalid backups cannot partially modify the existing library", () => {
  const current = fixture(); const before = structuredClone(current);
  const bad = makeBackup(current); bad.data.students[0].payments[0].amount = -1;
  assert.throws(() => parseBackup(JSON.stringify(bad)));
  assert.deepEqual(current, before);
  assert.throws(() => parseBackup("not JSON"));
  assert.throws(() => parseBackup(JSON.stringify({ ...makeBackup(current), version: 999 })));
});
test("saved appearance and section visibility survive backup and merge preserves the current choice", () => {
  const incoming = {
    ...fixture(),
    defaultAppearance: {
      template: "protocol", color: "#dc3045", protocolAccent: "cyan", protocolMode: "dark",
      hiddenSections: { forge: ["pillars"], protocol: ["calendar", "legend"] },
    },
  };
  incoming.plans[0].hiddenSections = { forge: ["rhythm", "calendar"] };
  const parsed = parseBackup(JSON.stringify(makeBackup(incoming))).data;
  assert.deepEqual(parsed.defaultAppearance, incoming.defaultAppearance);
  assert.deepEqual(parsed.plans[0].hiddenSections, incoming.plans[0].hiddenSections);
  assert.deepEqual(restoreData(fixture(), parsed, "merge").defaultAppearance, incoming.defaultAppearance);
  const current = { ...fixture(), defaultAppearance: { template: "studio", color: "#123456" } };
  assert.deepEqual(restoreData(current, parsed, "merge").defaultAppearance, current.defaultAppearance);
  assert.equal(restoreData(current, fixture(), "replace").defaultAppearance, undefined);
});
test("poster themes and their independent visibility preferences survive backup", () => {
  const data = fixture();
  const original = data.plans[0];
  data.plans = [
    { ...original, template: "overdrive", hiddenSections: { overdrive: ["heroArt", "calendar"] } },
    {
      ...original, id: "pahlavan", template: "pahlavan",
      hiddenSections: { pahlavan: ["legend", "notes", "footer"] },
      sectionOrder: { pahlavan: ["calendar", "heroArt", "workouts", "legend", "notes", "cardio", "footer"] },
    },
  ];
  data.defaultAppearance = {
    template: "pahlavan",
    color: original.color,
    hiddenSections: { overdrive: ["heroArt"], pahlavan: ["cardio"] },
    sectionOrder: { pahlavan: ["heroArt", "workouts", "footer", "legend", "calendar", "notes", "cardio"] },
  };
  assert.deepEqual(parseBackup(JSON.stringify(makeBackup(data))).data, data);
});
test("duplicate IDs, broken student links and impossible payment dates are rejected", () => {
  const duplicate = makeBackup(fixture()); duplicate.data.plans.push(structuredClone(duplicate.data.plans[0]));
  assert.throws(() => parseBackup(JSON.stringify(duplicate)));
  const orphan = makeBackup(fixture()); orphan.data.plans[0].studentId = "missing";
  assert.throws(() => parseBackup(JSON.stringify(orphan)));
  const badDate = makeBackup(fixture()); badDate.data.students[0].payments[0].date = "2026-02-30";
  assert.throws(() => parseBackup(JSON.stringify(badDate)));
});
test("merge preserves local conflicts, adds new records and unions payment history without duplicates", () => {
  const current = fixture(); const incoming = fixture();
  incoming.coach = "مربی دیگر"; incoming.plans[0].title = "عنوان قدیمی";
  incoming.students[0].name = "نام قدیمی";
  incoming.students[0].payments = [payment("receipt", 1), payment("new-receipt", 500000)];
  incoming.students.push(makeStudent("شاگرد دوم", "new-student"));
  incoming.plans.push({ ...incoming.plans[0], id: "new-program" });
  incoming.blocks.push({ ...incoming.blocks[0], id: "new-block" });
  const result = restoreData(current, incoming, "merge");
  assert.equal(result.coach, current.coach);
  assert.equal(result.plans.length, 2);
  assert.equal(result.plans[0].title, current.plans[0].title);
  assert.equal(result.plans[1].athlete, current.students[0].name);
  assert.equal(result.students.length, 2);
  assert.deepEqual(result.students[0].payments.map((item) => item.amount), [2500000, 500000]);
  assert.deepEqual(restoreData(result, incoming, "merge"), result);
  assert.equal(result.blocks.length, 2);
});
test("full replacement restores the exact snapshot independently of current memory", () => {
  const current = fixture(); const incoming = fixture(); incoming.students[0].payments = [];
  const result = restoreData(current, incoming, "replace");
  assert.deepEqual(result, incoming);
  result.plans[0].days[0].exercises[0].name = "تغییر";
  assert.equal(incoming.plans[0].days[0].exercises[0].name, "اسکوات");
  assert.equal(current.students[0].payments.length, 1);
});
test("training systems survive backup in plans and blocks, and unknown systems are rejected", () => {
  const data = fixture();
  data.plans[0].days[0].exercises = [
    { ...data.plans[0].days[0].exercises[0], trainingSystem: "drop-set", reps: "۱۲-۶" },
    { ...data.plans[0].days[0].exercises[0], id: "pause", trainingSystem: "rest-pause", reps: "۵-۵-۵" },
  ];
  data.blocks[0].exercises[0].trainingSystem = "fst-7";
  assert.deepEqual(parseBackup(JSON.stringify(makeBackup(data))).data, data);
  data.blocks[0].exercises[0].trainingSystem = "unknown";
  assert.throws(() => parseBackup(JSON.stringify(makeBackup(data))));
});
