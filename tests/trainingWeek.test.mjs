import test from 'node:test';
import assert from 'node:assert/strict';
import { assignTrainingWeek, getWeekdaySession, resizeTrainingWeek } from '../src/trainingWeek.ts';
const session = (id) => ({ id, name: id, focus: `focus-${id}`, exercises: [{ id: `exercise-${id}`, name: id, sets: '4', reps: '8', rest: '90', note: 'keep', group: 'A' }] });
const plan = { days: ['a', 'b', 'c', 'd'].map(session), schedule: ['a', 'b', 'استراحت', 'c', 'd', 'استراحت', 'استراحت'] };
const createDay = () => session('new');
test('deselecting Sunday deletes its middle session, keeping every other weekday intact', () => {
  const result = resizeTrainingWeek(plan, [true, false, false, true, true, false, false], createDay);
  assert.deepEqual(result.schedule, ['روز اول', 'استراحت', 'استراحت', 'روز دوم', 'روز سوم', 'استراحت', 'استراحت']);
  assert.deepEqual(result.days.map(d => d.id), ['a', 'c', 'd']);
  assert.equal(result.days[1].exercises, plan.days[2].exercises);
  assert.equal(plan.days.length, 4);
  assert.equal(plan.days[0].name, 'a');
});
test('adding Monday inserts a blank session without moving other weekdays content', () => {
  const result = resizeTrainingWeek(plan, [true, true, true, true, true, false, false], createDay);
  assert.deepEqual(result.days.map(d => d.id), ['a', 'b', 'new', 'c', 'd']);
  assert.deepEqual(getWeekdaySession(result, 4).exercises, plan.days[3].exercises);
});
test('reordering moves whole sessions and updates names and calendar', () => {
  const result = assignTrainingWeek([plan.days[3], ...plan.days.slice(0, 3)], [true, false, true, false, true, false, true]);
  assert.equal(result.days[0].id, 'd');
  assert.equal(result.days[0].focus, 'focus-d');
  assert.deepEqual(result.days[0].exercises, plan.days[3].exercises);
  assert.equal(result.days[0].name, 'روز اول');
  assert.equal(result.schedule[6], 'روز چهارم');
  const removedFirst = resizeTrainingWeek(result, [false, false, true, false, true, false, true], createDay);
  assert.deepEqual(removedFirst.days.map(d => d.id), ['a', 'b', 'c']);
});
test('adding an earlier weekday keeps existing later weekdays attached to their sessions', () => {
  const laterPlan = { days: [session('a'), session('b')], schedule: ['استراحت', 'a', 'استراحت', 'b', 'استراحت', 'استراحت', 'استراحت'] };
  const result = resizeTrainingWeek(laterPlan, [true, true, false, true, false, false, false], createDay);
  assert.deepEqual(result.days.map(d => d.id), ['new', 'a', 'b']);
  assert.equal(getWeekdaySession(result, 1).id, 'a');
  assert.equal(getWeekdaySession(result, 3).id, 'b');
});
test('legacy sessions without weekday assignments are preserved', () => {
  const result = resizeTrainingWeek({ ...plan, schedule: [] }, [false, true, false, false, false, false, false], createDay);
  assert.deepEqual(result.days.map(d => d.id), ['a', 'b', 'c', 'd']);
});
test('clearing selections produces a rest week without stale assignments', () => {
  const result = resizeTrainingWeek(plan, Array(7).fill(false), createDay);
  assert.deepEqual(result.days, []);
  assert.deepEqual(result.schedule, Array(7).fill('استراحت'));
});
