import moment from 'moment'
import momentTZ from 'moment-timezone'

export const DISPLAY_FORMAT = 'M/D/YYYY h:mm a'

export function formatDate (subject, displayFmt = DISPLAY_FORMAT) {
  const parseFormats = [
    'YYYY-MM-DD hh:mm:ss',
    'M/D/YYYY h:mm a',
    'DD-MM-YYYY hh:mm:ss',
    'DD-MMM-YYYY hh:mm:ss',
    'DD-MMM-YY hh:mm:ss.SSSSSS A'
  ]

  // Handle Oracle format: DD-MMM-YY HH.MM.SS.SSSSSS AM/PM
  if (typeof subject === 'string' && subject.match(/\d{2}-[A-Z]{3}-\d{2} \d{2}\.\d{2}\.\d{2}\.\d{6} [AP]M/)) {
    // Convert dots to colons and add century to year
    const oracleConverted = subject.replace(/(\d{2}-[A-Z]{3}-)(\d{2})( \d{2})\.(\d{2})\.(\d{2})\.(\d{6}) ([AP]M)/, '$120$2$3:$4:$5.$6 $7');
    // Try to parse with moment
    const oracleParsed = moment(oracleConverted, 'DD-MMM-YYYY hh:mm:ss.SSSSSS A');
    if (oracleParsed.isValid()) {
      return oracleParsed.format(displayFmt);
    }
  }

  const validFormats = parseFormats.filter(format => {
    return moment([subject], format).isValid()
  })

  return validFormats.length ? moment([subject], validFormats[0]).format(displayFmt) : ''
}

export function utcToLocal (subject, displayFmt = DISPLAY_FORMAT) {
  return subject ? moment.utc(subject).local().format(displayFmt) : ''
}

export function utcToRelative (subject) {
  return subject ? moment.utc(subject).local().fromNow() : ''
}

export function toLocalDateTime (utcTime) {
  if (utcTime == '') return ''

  const localTime = moment.utc(utcTime, DISPLAY_FORMAT).toDate()

  return moment(localTime, DISPLAY_FORMAT).format(DISPLAY_FORMAT)
}

export function toLocalFromDateTimez (str, timeZone) {
  if (!str) return null

  const time = momentTZ.tz(str.substr(0, 19), timeZone)

  return time.local().format(DISPLAY_FORMAT)
}