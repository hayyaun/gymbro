import test from 'node:test';
import assert from 'node:assert/strict';
import { assignTrainingWeek, resizeTrainingWeek } from '../src/trainingWeek.ts';
const session = (id) => ({ id, name: id, focus: `focus-${id}`, exercises: [{ id: `exercise-${id}`, name: id, sets: '4', reps: '8', rest: '90', note: 'keep', group: 'A' }] });
const plan = { days: ['a', 'b', 'c', 'd'].map(session), schedule: [] };
const createDay = () => session('new');
test('week order removes only the end and preserves exercise details without mutation', () => {
  const result = resizeTrainingWeek(plan, [false, true, false, true, false, true, false], createDay);
  assert.deepEqual(result.schedule, ['استراحت', 'روز اول', 'استراحت', 'روز دوم', 'استراحت', 'روز سوم', 'استراحت']);
  assert.deepEqual(result.days.map(d => d.id), ['a', 'b', 'c']);
  assert.equal(result.days[1].exercises, plan.days[1].exercises);
  assert.equal(plan.days.length, 4);
  assert.equal(plan.days[0].name, 'a');
});
test('growing selections preserves existing sessions', () => {
  const result = resizeTrainingWeek(plan, [true, true, true, true, true, false, false], createDay);
  assert.deepEqual(result.days.map(d => d.id), ['a', 'b', 'c', 'd', 'new']);
  assert.deepEqual(result.days[3].exercises, plan.days[3].exercises);
});
test('reordering moves whole sessions and updates names and calendar', () => {
  const result = assignTrainingWeek([plan.days[3], ...plan.days.slice(0, 3)], [true, false, true, false, true, false, true]);
  assert.equal(result.days[0].id, 'd');
  assert.equal(result.days[0].focus, 'focus-d');
  assert.deepEqual(result.days[0].exercises, plan.days[3].exercises);
  assert.equal(result.days[0].name, 'روز اول');
  assert.equal(result.schedule[6], 'روز چهارم');
});
test('clearing selections produces a rest week without stale assignments', () => {
  const result = resizeTrainingWeek(plan, Array(7).fill(false), createDay);
  assert.deepEqual(result.days, []);
  assert.deepEqual(result.schedule, Array(7).fill('استراحت'));
});
