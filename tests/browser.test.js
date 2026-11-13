const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const core = fs.readFileSync(path.join(root, 'assets/js/core.js'), 'utf8');
const app = fs.readFileSync(path.join(root, 'assets/js/script.js'), 'utf8');

function openPlanner(seed) {
  const browser = new JSDOM(html, {
    url: 'https://daymark.example/',
    runScripts: 'outside-only',
    pretendToBeVisual: true
  });
  if (seed) seed(browser.window.localStorage);
  browser.window.eval(core);
  browser.window.eval(app);
  return browser;
}

test('the planner builds nine working hours without third-party scripts', () => {
  const dom = openPlanner();
  const doc = dom.window.document;
  const slots = [...doc.querySelectorAll('.time-slot')];
  assert.equal(slots.length, 9);
  assert.equal(slots[0].dataset.hour, '9');
  assert.equal(slots[8].dataset.hour, '17');
  assert.equal(doc.querySelectorAll('.week-day').length, 7);
  assert.equal(doc.querySelector('#freeCount').textContent, '9');
  dom.window.close();
});

test('editing and Save persist the correct hour; changing dates isolates data', () => {
  const dom = openPlanner();
  const w = dom.window, doc = w.document;
  const originalDate = doc.querySelector('#dayPicker').value;
  const first = doc.querySelector('.time-slot[data-hour="9"]');
  const input = first.querySelector('textarea');
  input.value = 'Prepare launch brief';
  input.dispatchEvent(new w.Event('input', { bubbles: true }));
  first.querySelector('[data-action="save"]').click();
  const saved = JSON.parse(w.localStorage.getItem('daymark:v1:' + originalDate));
  assert.equal(saved.entries['9'], 'Prepare launch brief');
  assert.equal(doc.querySelector('#plannedCount').textContent, '1');

  doc.querySelector('#nextDay').click();
  assert.notEqual(doc.querySelector('#dayPicker').value, originalDate);
  assert.equal(doc.querySelector('.time-slot[data-hour="9"] textarea').value, '');
  doc.querySelector('#previousDay').click();
  assert.equal(doc.querySelector('.time-slot[data-hour="9"] textarea').value, 'Prepare launch brief');
  dom.window.close();
});

test('priority, notes, working hours, clear, and undo work together', () => {
  const dom = openPlanner();
  const w = dom.window, doc = w.document;
  const priority = doc.querySelector('#priorityInput');
  priority.value = 'Finish design review';
  priority.dispatchEvent(new w.Event('input', { bubbles: true }));
  priority.dispatchEvent(new w.Event('blur'));
  const note = doc.querySelector('#noteInput');
  note.value = 'Call Sam';
  note.dispatchEvent(new w.Event('input', { bubbles: true }));
  note.dispatchEvent(new w.Event('blur'));

  const start = doc.querySelector('#startHour');
  start.value = '8';
  start.dispatchEvent(new w.Event('change'));
  assert.equal(doc.querySelectorAll('.time-slot').length, 10);
  assert.equal(doc.querySelector('.time-slot').dataset.hour, '8');
  assert.equal(doc.querySelector('#priorityInput').value, 'Finish design review');

  w.confirm = () => true;
  doc.querySelector('#clearDay').click();
  assert.equal(doc.querySelector('#priorityInput').value, '');
  doc.querySelector('#undoButton').click();
  assert.equal(doc.querySelector('#priorityInput').value, 'Finish design review');
  assert.equal(doc.querySelector('#noteInput').value, 'Call Sam');
  dom.window.close();
});

test('legacy nine-slot task arrays are imported once on first load', () => {
  const dom = openPlanner(storage => {
    storage.setItem('current-tasks', JSON.stringify(['Old first task', null, null, null, null, null, null, null, 'Old last task']));
  });
  const doc = dom.window.document;
  assert.equal(doc.querySelector('.time-slot[data-hour="9"] textarea').value, 'Old first task');
  assert.equal(doc.querySelector('.time-slot[data-hour="17"] textarea').value, 'Old last task');
  assert.equal(dom.window.localStorage.getItem('daymark:legacy-imported'), 'yes');
  dom.window.close();
});
