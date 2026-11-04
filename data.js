/* Validation shared by the browser and regression tests. Storage remains kg/cm. */
(function (root) {
  'use strict';
  const record = value => !!value && typeof value === 'object' && !Array.isArray(value);
  const number = (value, min, max) => value !== '' && value !== null && value !== undefined && Number.isFinite(Number(value)) && Number(value) >= min && Number(value) <= max;
  function validDate(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(value + 'T12:00:00Z');
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }
  function validExercise(exercise) {
    return record(exercise) && typeof exercise.id === 'string' && exercise.id.length > 0 &&
      Number.isInteger(Number(exercise.sets)) && number(exercise.sets, 1, 6) &&
      Number.isInteger(Number(exercise.min)) && number(exercise.min, 1, 30) &&
      Number.isInteger(Number(exercise.max)) && number(exercise.max, Number(exercise.min), 40) &&
      number(exercise.increment, 0.25, 25) &&
      (exercise.startWeight === '' || exercise.startWeight == null || number(exercise.startWeight, 0.001, 3000));
  }
  function validateBackup(data) {
    const fail = message => { throw new Error(message); };
    if (!record(data) || !Array.isArray(data.sessions)) fail('Backup does not contain workout history.');
    for (const session of data.sessions) {
      if (!record(session) || !validDate(session.date) || !record(session.items) || !Object.keys(session.items).length) fail('A workout has an invalid date or exercise list.');
      for (const sets of Object.values(session.items)) {
        if (!Array.isArray(sets) || !sets.length || sets.length > 6 || sets.some(set => !record(set) || !number(set.weight, 0.001, 3000) || !Number.isInteger(Number(set.reps)) || !number(set.reps, 1, 100) || (set.rir != null && set.rir !== '' && (!number(set.rir, 0, 10) || !Number.isInteger(Number(set.rir)))))) fail('A workout contains invalid sets.');
      }
      if (session.planSnapshot !== undefined && (!Array.isArray(session.planSnapshot) || session.planSnapshot.some(ex => !validExercise(ex)))) fail('A workout contains an invalid exercise snapshot.');
    }
    if (data.increments != null && (!record(data.increments) || Object.values(data.increments).some(n => !number(n, 0.001, 10000)))) fail('Invalid weight increments.');
    if (data.metrics_v11 !== undefined) {
      const metrics = data.metrics_v11;
      if (!record(metrics) || (metrics.body !== undefined && (!Array.isArray(metrics.body) || metrics.body.some(row => !record(row) || !validDate(row.date) || !number(row.weight, 0.001, 10000)))) || (metrics.targets !== undefined && (!record(metrics.targets) || Object.values(metrics.targets).some(n => !number(n, 0.001, 10000)))) || (metrics.bodyTarget != null && metrics.bodyTarget !== '' && !number(metrics.bodyTarget, 0, 10000))) fail('Invalid body-weight or goal data.');
    }
    if (data.plans_v17 != null) {
      const plans = data.plans_v17;
      if (!record(plans) || !Array.isArray(plans.plans) || !plans.plans.length || plans.plans.some(plan => !record(plan) || typeof plan.id !== 'string' || !plan.id || typeof plan.name !== 'string' || !plan.name || !Array.isArray(plan.exercises) || !plan.exercises.length || plan.exercises.some(ex => !validExercise(ex)))) fail('Invalid workout plans.');
      if (new Set(plans.plans.map(p => p.id)).size !== plans.plans.length) fail('Duplicate plan IDs.');
    }
    if (data.wellness_v23 !== undefined) {
      const wellness = data.wellness_v23;
      if (!record(wellness) || !Array.isArray(wellness.measurements) || wellness.measurements.some(row => !record(row) || !validDate(row.date) || ['chest','waist','arm','thigh','shoulders'].some(key => row[key] !== undefined && !number(row[key], 1, 300)))) fail('Invalid body measurements.');
    }
    if (data.photos_v23 !== undefined && (!Array.isArray(data.photos_v23) || data.photos_v23.some(photo => !record(photo) || typeof photo.id !== 'string' || !photo.id || !validDate(photo.date) || !['front','side','back'].includes(photo.view) || typeof photo.dataUrl !== 'string' || !/^data:image\/(jpeg|png|webp|gif);base64,/i.test(photo.dataUrl)) || new Set(data.photos_v23.map(p => p.id)).size !== data.photos_v23.length)) fail('Invalid or duplicate progress photos.');
    if (data.achievements_v30 !== undefined && (!record(data.achievements_v30) || !Array.isArray(data.achievements_v30.seen) || data.achievements_v30.seen.some(id => typeof id !== 'string'))) fail('Invalid achievements.');
    return data;
  }
  function corePayload(data) {
    const { type, version, exportedAt, metrics_v11, plans_v17, wellness_v23, photos_v23, achievements_v30, ...core } = data;
    return core;
  }
  const api = { validDate, validExercise, validateBackup, corePayload };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GBData = api;
})(typeof window !== 'undefined' ? window : globalThis);
