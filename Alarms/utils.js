export function filterAlarmsBySeverity (alarms, criteria) {
  return alarms.filter(a => criteria.get(a.get('severity').toLowerCase()))
}
