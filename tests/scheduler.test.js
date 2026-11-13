const test = require('node:test');
const assert = require('node:assert/strict');
const planner = require('../assets/js/core.js');

test('date keys are local dates, not UTC dates', () => {
  assert.equal(planner.localDateKey(new Date(2026, 10, 13, 23, 45)), '2026-11-13');
  assert.equal(planner.parseDateKey('2026-02-30'), null);
  assert.equal(planner.parseDateKey('nonsense'), null);
  assert.equal(planner.localDateKey(planner.parseDateKey('2026-11-13')), '2026-11-13');
});

test('day navigation survives month and daylight-saving boundaries', () => {
  assert.equal(planner.localDateKey(planner.addDays(new Date(2026, 9, 31), 1)), '2026-11-01');
  assert.equal(planner.localDateKey(planner.addDays(new Date(2026, 2, 7), 2)), '2026-03-09');
  assert.equal(planner.localDateKey(planner.startOfWeek(new Date(2026, 10, 13))), '2026-11-09');
});

test('hour highlighting compares hours and calendar days', () => {
  const now = new Date(2026, 10, 13, 10, 37);
  assert.equal(planner.hourState('2026-11-13', 9, now), 'past');
  assert.equal(planner.hourState('2026-11-13', 10, now), 'present');
  assert.equal(planner.hourState('2026-11-13', 11, now), 'future');
  assert.equal(planner.hourState('2026-11-12', 17, now), 'past');
  assert.equal(planner.hourState('2026-11-14', 9, now), 'future');
});

test('legacy entries import to matching 9am–5pm hours', () => {
  const old = ['9am task', '', null, 'Lunch', '', '', '', '', '5pm task'];
  const imported = planner.migrateLegacy(JSON.stringify(old));
  assert.equal(imported.entries['9'], '9am task');
  assert.equal(imported.entries['12'], 'Lunch');
  assert.equal(imported.entries['17'], '5pm task');
  assert.equal(planner.migrateLegacy('{broken'), null);
});

test('corrupt or unsafe storage payloads normalize safely', () => {
  assert.deepEqual(planner.readDay('bad data'), planner.emptyDay());
  const day = planner.readDay(JSON.stringify({
    entries: { '9': 'Write report', '-1': 'bad', '24': 'bad', '10': 123 },
    priority: 'Ship project',
    note: 'Remember to take breaks'
  }));
  assert.deepEqual(day.entries, { '9': 'Write report' });
  assert.equal(day.priority, 'Ship project');
  assert.equal(planner.normalizeSettings({ startHour: 1, endHour: 25 }).startHour, 9);
});

test('coverage reflects actual planned slots', () => {
  const day = { entries: { '9': 'Plan', '10': '   ', '11': 'Review' } };
  assert.deepEqual(planner.daySummary(day, { startHour: 9, endHour: 11 }),
    { planned: 2, free: 1, total: 3, percent: 67 });
});

test('clock formatting handles noon and midnight', () => {
  assert.equal(planner.hourLabel(0), '12:00 AM');
  assert.equal(planner.hourLabel(12), '12:00 PM');
  assert.equal(planner.hourLabel(17), '5:00 PM');
});
