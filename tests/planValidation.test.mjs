import assert from "node:assert/strict";
import test from "node:test";
import { preparePlanForSave } from "../src/planValidation.ts";

const blank = { id: "blank", name: "", sets: "3", reps: "10–12", rest: "60", group: "", note: "" };
const squat = { ...blank, id: "squat", name: "اسکوات" };
const plan = {
  title: "برنامه",
  athlete: "ورزشکار",
  weeks: "6",
  days: [{ id: "first", name: "روز اول", exercises: [squat] }],
};

test("unused movement rows between filled rows do not block a save", () => {
  const press = { ...squat, id: "press", name: "پرس سینه" };
  const draft = { ...plan, days: [{ ...plan.days[0], exercises: [squat, blank, press] }] };
  const result = preparePlanForSave(draft);
  assert.deepEqual(result.plan.days[0].exercises, [squat, press]);
  assert.equal(draft.days[0].exercises.length, 3);
});

test("a partially edited movement in a later session reports its exact missing field", () => {
  const draft = { ...plan, days: [
    ...plan.days,
    { id: "second", name: "روز دوم", exercises: [{ ...blank, rest: "" }] },
  ] };
  assert.deepEqual(preparePlanForSave(draft).issue, {
    tab: "workout", dayId: "second", fieldId: "exercise-blank-name",
    message: "جلسه ۲، نام حرکت ۱ را وارد کنید",
  });
  draft.days[1].exercises[0].name = "پرس سینه";
  assert.equal(preparePlanForSave(draft).issue.fieldId, "exercise-blank-rest");
});

test("a session of untouched rows still requires a movement", () => {
  const draft = { ...plan, days: [{ ...plan.days[0], exercises: [blank] }] };
  const { issue } = preparePlanForSave(draft);
  assert.equal(issue.dayId, "first");
  assert.equal(issue.fieldId, "exercise-blank-name");
  assert.match(issue.message, /حداقل یک حرکت/);
});
