(function () {
  'use strict';

  var Core = window.PlannerCore;
  if (!Core) return;

  function byId(id) { return document.getElementById(id); }
  var els = {
    clock: byId('liveClock'),
    heroDate: byId('heroDate'),
    heroSubtitle: byId('heroSubtitle'),
    picker: byId('dayPicker'),
    weekLabel: byId('weekLabel'),
    week: byId('weekStrip'),
    priority: byId('priorityInput'),
    note: byId('noteInput'),
    start: byId('startHour'),
    end: byId('endHour'),
    planned: byId('plannedCount'),
    free: byId('freeCount'),
    coverage: byId('coverageCount'),
    coverageBar: byId('coverageBar'),
    summaryLabel: byId('summaryLabel'),
    plannerTitle: byId('plannerTitle'),
    plannerMeta: byId('plannerMeta'),
    timeline: byId('timeline'),
    template: byId('slotTemplate'),
    saveStatus: byId('saveStatus'),
    toast: byId('toast'),
    toastText: byId('toastText'),
    undo: byId('undoButton')
  };

  var dateFormat = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  var shortDateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' });
  var weekdayFormat = new Intl.DateTimeFormat('en-US', { weekday: 'narrow' });
  var weekdayLong = new Intl.DateTimeFormat('en-US', { weekday: 'long' });
  var clockFormat = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' });
  var selectedDate = Core.localDateKey(new Date());
  var settings = loadSettings();
  var currentDay = loadDay(selectedDate);
  var saveTimer = null;
  var toastTimer = null;
  var dirty = false;
  var undoSnapshot = null;
  var storageWorks = testStorage();

  function testStorage() {
    try {
      var name = 'daymark:storage-test';
      localStorage.setItem(name, '1');
      localStorage.removeItem(name);
      return true;
    } catch (_) { return false; }
  }

  function readStorage(key) {
    try { return localStorage.getItem(key); } catch (_) { return null; }
  }

  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (_) { return false; }
  }

  function loadSettings() {
    var raw = readStorage(Core.SETTINGS_KEY);
    try { return Core.normalizeSettings(JSON.parse(raw)); }
    catch (_) { return Core.normalizeSettings(null); }
  }

  function loadDay(dateKey) {
    var raw = readStorage(Core.DAY_PREFIX + dateKey);
    if (raw !== null) return Core.readDay(raw);

    // Migrate an old 9–5 scheduler array once, only onto the date first opened today.
    if (dateKey === Core.localDateKey(new Date()) && readStorage(Core.LEGACY_FLAG) !== 'yes') {
      var previous = Core.migrateLegacy(readStorage(Core.LEGACY_KEY));
      if (previous) {
        if (writeStorage(Core.DAY_PREFIX + dateKey, JSON.stringify(previous))) {
          writeStorage(Core.LEGACY_FLAG, 'yes');
        }
        return previous;
      }
    }
    return Core.emptyDay();
  }

  function setStatus(label, state) {
    els.saveStatus.dataset.state = state || 'saved';
    els.saveStatus.lastChild.textContent = ' ' + label;
  }

  function toast(message, canUndo) {
    window.clearTimeout(toastTimer);
    els.toastText.textContent = message;
    els.undo.hidden = !canUndo;
    els.toast.hidden = false;
    toastTimer = window.setTimeout(function () { els.toast.hidden = true; }, 5500);
  }

  function persist(showToast) {
    window.clearTimeout(saveTimer);
    if (!writeStorage(Core.DAY_PREFIX + selectedDate, JSON.stringify(currentDay))) {
      storageWorks = false;
      setStatus('Storage unavailable — changes are not saved', 'error');
      if (showToast) toast('Could not save. Check browser storage settings.', false);
      return false;
    }
    storageWorks = true;
    dirty = false;
    setStatus('Saved on this device', 'saved');
    if (showToast) toast('Your schedule is saved.', false);
    return true;
  }

  function queueSave() {
    dirty = true;
    setStatus(storageWorks ? 'Saving…' : 'Storage unavailable', storageWorks ? 'saving' : 'error');
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(function () { persist(false); }, 400);
  }

  function formatDay(dateKey) {
    var date = Core.parseDateKey(dateKey);
    return date ? dateFormat.format(date) : dateKey;
  }

  function selectDay(dateKey) {
    if (!Core.parseDateKey(dateKey) || dateKey === selectedDate) return;
    if (dirty && !persist(false)) {
      window.alert('Your browser could not save this day. Please enable storage before switching dates.');
      return;
    }
    selectedDate = dateKey;
    currentDay = loadDay(dateKey);
    undoSnapshot = null;
    render();
  }

  function buildSelect(select, min, max) {
    for (var hour = min; hour <= max; hour++) {
      var option = document.createElement('option');
      option.value = String(hour);
      option.textContent = Core.hourLabel(hour);
      select.appendChild(option);
    }
  }

  function buildWeek() {
    var start = Core.startOfWeek(Core.parseDateKey(selectedDate));
    var today = Core.localDateKey(new Date());
    var fragment = document.createDocumentFragment();
    for (var dayOffset = 0; dayOffset < 7; dayOffset++) {
      var date = Core.addDays(start, dayOffset);
      var key = Core.localDateKey(date);
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'week-day';
      button.dataset.date = key;
      button.dataset.selected = String(key === selectedDate);
      button.dataset.today = String(key === today);
      button.setAttribute('aria-pressed', String(key === selectedDate));
      button.setAttribute('aria-label', formatDay(key) + (key === today ? ', today' : ''));
      var weekday = document.createElement('span');
      weekday.textContent = weekdayFormat.format(date);
      var number = document.createElement('strong');
      number.textContent = String(date.getDate());
      button.appendChild(weekday);
      button.appendChild(number);
      fragment.appendChild(button);
    }
    els.week.replaceChildren(fragment);
    els.weekLabel.textContent = shortDateFormat.format(Core.parseDateKey(selectedDate));
  }

  function buildSlot(hour) {
    var row = els.template.content.firstElementChild.cloneNode(true);
    var hourText = (hour % 12) || 12;
    var suffix = hour >= 12 ? 'PM' : 'AM';
    var id = 'slot-' + hour;
    row.dataset.hour = String(hour);
    row.querySelector('.slot-hour').textContent = hourText + ':00';
    row.querySelector('.slot-suffix').textContent = suffix;
    var input = row.querySelector('.slot-input');
    input.id = id;
    input.dataset.hour = String(hour);
    input.value = currentDay.entries[String(hour)] || '';
    var label = row.querySelector('.slot-label');
    label.htmlFor = id;
    label.textContent = 'Plan for ' + Core.hourLabel(hour);
    row.querySelector('.slot-save').setAttribute('aria-label', 'Save ' + Core.hourLabel(hour));
    row.querySelector('.slot-clear').setAttribute('aria-label', 'Clear ' + Core.hourLabel(hour));
    updateFilled(row);
    return row;
  }

  function updateFilled(row) {
    var hour = row.dataset.hour;
    var filled = !!(currentDay.entries[hour] && currentDay.entries[hour].trim());
    row.dataset.filled = String(filled);
    row.querySelector('.slot-hint').textContent = filled ? 'Added to your day' : 'Click to add a task or note';
  }

  function updateClockAndStates() {
    var now = new Date();
    els.clock.textContent = clockFormat.format(now);
    els.timeline.querySelectorAll('.time-slot').forEach(function (row) {
      var status = Core.hourState(selectedDate, Number(row.dataset.hour), now);
      row.dataset.state = status;
      row.querySelector('.slot-state').textContent = status === 'past' ? 'Earlier' : status === 'present' ? 'Right now' : 'Upcoming';
    });
  }

  function updateSummary() {
    var summary = Core.daySummary(currentDay, settings);
    els.planned.textContent = String(summary.planned);
    els.free.textContent = String(summary.free);
    els.coverage.textContent = summary.percent + '%';
    els.coverageBar.style.width = summary.percent + '%';
    els.summaryLabel.textContent = summary.planned === 0
      ? 'A blank canvas, for now.'
      : summary.planned === summary.total
        ? 'Your day has a plan.'
        : 'One block at a time.';
    els.plannerMeta.textContent = summary.planned + ' of ' + summary.total +
      ' hours planned · Give each hour a purpose, or leave room to improvise.';
  }

  function render() {
    var today = Core.localDateKey(new Date());
    els.heroDate.textContent = formatDay(selectedDate);
    els.heroSubtitle.textContent = selectedDate === today
      ? 'A fresh day, a fresh start.'
      : selectedDate < today ? 'A look at what you had planned.' : 'A head start on a good day.';
    els.picker.value = selectedDate;
    els.priority.value = currentDay.priority;
    els.note.value = currentDay.note;
    els.start.value = String(settings.startHour);
    els.end.value = String(settings.endHour);
    els.plannerTitle.textContent = selectedDate === today
      ? "Today's timeline"
      : weekdayLong.format(Core.parseDateKey(selectedDate)) + "'s timeline";

    buildWeek();
    var fragment = document.createDocumentFragment();
    for (var hour = settings.startHour; hour <= settings.endHour; hour++) {
      fragment.appendChild(buildSlot(hour));
    }
    els.timeline.replaceChildren(fragment);
    updateSummary();
    updateClockAndStates();
    if (!storageWorks) setStatus('Storage unavailable — changes are not saved', 'error');
    else setStatus('Saved on this device', 'saved');
  }

  function snapshotUndo() {
    undoSnapshot = { date: selectedDate, value: JSON.stringify(currentDay) };
  }

  function undo() {
    if (!undoSnapshot || selectedDate !== undoSnapshot.date) return;
    currentDay = Core.readDay(undoSnapshot.value);
    undoSnapshot = null;
    persist(false);
    render();
    toast('Change undone.', false);
  }

  function handleSlotAction(event) {
    var button = event.target.closest('[data-action]');
    if (!button) return;
    var row = button.closest('.time-slot');
    if (!row) return;
    var hour = row.dataset.hour;

    if (button.dataset.action === 'save') {
      currentDay.entries[hour] = row.querySelector('.slot-input').value;
      updateFilled(row);
      updateSummary();
      persist(true);
    }
    if (button.dataset.action === 'clear') {
      if (!currentDay.entries[hour]) return;
      snapshotUndo();
      delete currentDay.entries[hour];
      row.querySelector('.slot-input').value = '';
      updateFilled(row);
      updateSummary();
      persist(false);
      toast('Cleared ' + Core.hourLabel(Number(hour)) + '.', true);
    }
  }

  function clearDay() {
    var hasContent = !!(currentDay.priority.trim() || currentDay.note.trim() ||
      Object.keys(currentDay.entries).some(function (key) { return currentDay.entries[key].trim(); }));
    if (!hasContent) { toast('This day is already clear.', false); return; }
    if (!window.confirm('Clear all plans and notes for ' + formatDay(selectedDate) + '? You can undo this action.')) return;
    snapshotUndo();
    currentDay = Core.emptyDay();
    persist(false);
    render();
    toast('Day cleared.', true);
  }

  function exportDay() {
    if (dirty) persist(false);
    var lines = ['DAYMARK — ' + formatDay(selectedDate), ''];
    if (currentDay.priority.trim()) lines.push('TOP PRIORITY', currentDay.priority.trim(), '');
    lines.push('SCHEDULE');
    for (var hour = settings.startHour; hour <= settings.endHour; hour++) {
      var entry = (currentDay.entries[String(hour)] || '').trim();
      lines.push(Core.hourLabel(hour) + '  ' + (entry || '—'));
    }
    if (currentDay.note.trim()) lines.push('', 'NOTES', currentDay.note.trim());
    lines.push('', 'Created with Daymark. Saved locally in your browser.');
    try {
      var blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'daymark-' + selectedDate + '.txt';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      toast('Your day was exported.', false);
    } catch (_) {
      toast('Export did not work in this browser.', false);
    }
  }

  // Wire every event once; re-rendered slots use delegated listeners.
  buildSelect(els.start, 6, 12);
  buildSelect(els.end, 13, 22);

  byId('previousDay').addEventListener('click', function () {
    selectDay(Core.localDateKey(Core.addDays(Core.parseDateKey(selectedDate), -1)));
  });
  byId('nextDay').addEventListener('click', function () {
    selectDay(Core.localDateKey(Core.addDays(Core.parseDateKey(selectedDate), 1)));
  });
  byId('todayButton').addEventListener('click', function () {
    selectDay(Core.localDateKey(new Date()));
  });
  els.picker.addEventListener('change', function () {
    selectDay(els.picker.value);
    els.picker.value = selectedDate;
  });
  els.week.addEventListener('click', function (event) {
    var button = event.target.closest('[data-date]');
    if (button) selectDay(button.dataset.date);
  });
  els.timeline.addEventListener('input', function (event) {
    if (!event.target.classList.contains('slot-input')) return;
    var hour = event.target.dataset.hour;
    currentDay.entries[hour] = event.target.value;
    updateFilled(event.target.closest('.time-slot'));
    updateSummary();
    queueSave();
  });
  els.timeline.addEventListener('click', handleSlotAction);
  els.timeline.addEventListener('focusout', function (event) {
    if (event.target.classList.contains('slot-input') && dirty) persist(false);
  });
  els.priority.addEventListener('input', function () {
    currentDay.priority = els.priority.value;
    queueSave();
  });
  els.note.addEventListener('input', function () {
    currentDay.note = els.note.value;
    queueSave();
  });
  [els.priority, els.note].forEach(function (input) {
    input.addEventListener('blur', function () { if (dirty) persist(false); });
  });
  [els.start, els.end].forEach(function (input) {
    input.addEventListener('change', function () {
      if (dirty && !persist(false)) { input.value = input === els.start ? settings.startHour : settings.endHour; return; }
      settings = Core.normalizeSettings({ startHour: els.start.value, endHour: els.end.value });
      if (!writeStorage(Core.SETTINGS_KEY, JSON.stringify(settings))) {
        toast('Working hours could not be saved on this device.', false);
      }
      render();
    });
  });
  byId('clearDay').addEventListener('click', clearDay);
  byId('exportDay').addEventListener('click', exportDay);
  byId('dismissToast').addEventListener('click', function () { els.toast.hidden = true; });
  els.undo.addEventListener('click', undo);

  document.addEventListener('keydown', function (event) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
      event.preventDefault();
      persist(true);
    }
  });

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden' && dirty) persist(false);
    if (document.visibilityState === 'visible') updateClockAndStates();
  });
  window.addEventListener('pagehide', function () { if (dirty) persist(false); });
  window.addEventListener('storage', function (event) {
    if (event.key === Core.DAY_PREFIX + selectedDate && !dirty) {
      currentDay = Core.readDay(event.newValue);
      render();
    }
    if (event.key === Core.SETTINGS_KEY) {
      if (dirty && !persist(false)) return;
      settings = loadSettings();
      render();
    }
  });

  render();
  window.setInterval(updateClockAndStates, 30000);
})();
