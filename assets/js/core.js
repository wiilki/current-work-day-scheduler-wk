(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.PlannerCore = api;
})(typeof window !== 'undefined' ? window : null, function () {
  'use strict';

  var DAY_PREFIX = 'daymark:v1:';
  var SETTINGS_KEY = 'daymark:settings:v1';
  var LEGACY_KEY = 'current-tasks';
  var LEGACY_FLAG = 'daymark:legacy-imported';

  function pad(n) { return String(n).padStart(2, '0'); }

  function localDateKey(date) {
    return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
  }

  function parseDateKey(key) {
    if (typeof key !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(key)) return null;
    var pieces = key.split('-').map(Number);
    var date = new Date(pieces[0], pieces[1] - 1, pieces[2], 12);
    if (!Number.isFinite(date.getTime()) || localDateKey(date) !== key) return null;
    return date;
  }

  function addDays(date, amount) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount, 12);
  }

  function startOfWeek(date) {
    return addDays(date, -((date.getDay() + 6) % 7));
  }

  function hourLabel(hour) {
    return ((hour % 12) || 12) + ':00 ' + (hour >= 12 ? 'PM' : 'AM');
  }

  function hourState(dateKey, hour, now) {
    var today = localDateKey(now);
    if (dateKey < today) return 'past';
    if (dateKey > today) return 'future';
    if (hour < now.getHours()) return 'past';
    if (hour > now.getHours()) return 'future';
    return 'present';
  }

  function emptyDay() {
    return { entries: {}, priority: '', note: '' };
  }

  function readDay(raw) {
    var day = emptyDay();
    try {
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return day;
      if (parsed.entries && typeof parsed.entries === 'object' && !Array.isArray(parsed.entries)) {
        Object.keys(parsed.entries).forEach(function (key) {
          var number = Number(key);
          if (Number.isInteger(number) && number >= 0 && number <= 23 && String(number) === key &&
              typeof parsed.entries[key] === 'string') {
            day.entries[key] = parsed.entries[key].slice(0, 5000);
          }
        });
      }
      if (typeof parsed.priority === 'string') day.priority = parsed.priority.slice(0, 500);
      if (typeof parsed.note === 'string') day.note = parsed.note.slice(0, 3000);
    } catch (_) { /* Fall back to a blank day for malformed data. */ }
    return day;
  }

  function migrateLegacy(raw) {
    try {
      var previous = JSON.parse(raw);
      if (!Array.isArray(previous)) return null;
      var next = emptyDay();
      var any = false;
      for (var i = 0; i < 9; i++) {
        if (typeof previous[i] === 'string' && previous[i].trim()) {
          next.entries[String(i + 9)] = previous[i].slice(0, 5000);
          any = true;
        }
      }
      return any ? next : null;
    } catch (_) { return null; }
  }

  function normalizeSettings(value) {
    var start = Number(value && value.startHour);
    var end = Number(value && value.endHour);
    return {
      startHour: Number.isInteger(start) && start >= 6 && start <= 12 ? start : 9,
      endHour: Number.isInteger(end) && end >= 13 && end <= 22 ? end : 17
    };
  }

  function daySummary(day, settings) {
    var planned = 0;
    for (var hour = settings.startHour; hour <= settings.endHour; hour++) {
      if (typeof day.entries[String(hour)] === 'string' && day.entries[String(hour)].trim()) planned++;
    }
    var total = settings.endHour - settings.startHour + 1;
    return { planned: planned, free: total - planned, total: total, percent: Math.round((planned / total) * 100) };
  }

  return {
    DAY_PREFIX: DAY_PREFIX,
    SETTINGS_KEY: SETTINGS_KEY,
    LEGACY_KEY: LEGACY_KEY,
    LEGACY_FLAG: LEGACY_FLAG,
    localDateKey: localDateKey,
    parseDateKey: parseDateKey,
    addDays: addDays,
    startOfWeek: startOfWeek,
    hourLabel: hourLabel,
    hourState: hourState,
    emptyDay: emptyDay,
    readDay: readDay,
    migrateLegacy: migrateLegacy,
    normalizeSettings: normalizeSettings,
    daySummary: daySummary
  };
});
