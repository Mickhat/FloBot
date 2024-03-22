import moment from "moment-timezone"

/**
 * Converts a time string in German format to UTC time in millis since epoc
 *
 * @param dateToParse must be a string to parse in German format for the German timezone, e.g. 13:37:37.137
 * @returns time in UTC in millis since epoc e.g. 1710419768333 for 13.03.2024 23:05
 */
export function parse(dateToParse: string | number | boolean): undefined | number {
  if (typeof dateToParse !== 'string') {
    return undefined
  }
  if (/^\d{1,2}:\d{1,2}:\d{1,2}\.\d{1,3}$/g.test(dateToParse)) {
    return moment.tz(dateToParse, 'hh:mm:ss.SSS', 'Europe/Berlin').valueOf()
  }
  if (/^\d{1,2}:\d{1,2}:\d{1,2}$/g.test(dateToParse)) {
    return moment.tz(`${dateToParse}.000`, 'hh:mm:ss.SSS', 'Europe/Berlin').valueOf()
  }
  if (/^\d{1,2}:\d{1,2}$/g.test(dateToParse)) {
    return moment.tz(`13:${dateToParse}.000`, 'hh:mm:ss.SSS', 'Europe/Berlin').valueOf()
  }
  if (/^\d{1,2}\.\d{1,3}$/g.test(dateToParse)) {
    return moment.tz(`13:37:${dateToParse}`, 'hh:mm:ss.SSS', 'Europe/Berlin').valueOf()
  }
  if (/^\d{1,2}$/g.test(dateToParse)) {
    return moment.tz(`13:37:${dateToParse}.000`, 'hh:mm:ss.SSS', 'Europe/Berlin').valueOf()
  }
  return undefined
}

/**
 * Add the penalty time to the playTime (maybe in UTC or any other timezone, so result will be in the same timezone)
 *
 * @param playTime time in millis since epoc e.g. 1710419768333 for 13.03.2024 23:05
 * @returns the valid starting time in millis since epoc e.g. 1710419768333 for 13.03.2024 23:05
 */
export function calcValidFrom(playTime: number): number {
  if (playTime < 32472190800) {
    // playTime is in seconds (and less than 1.1.2999)
    playTime = playTime * 1000
  }
  const now = new Date(Date.now()) // now in UTC date
  const berlinDate = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Berlin' }))
  let offset = 999
  // rules: Mitternacht tippt sind es 65s, wenn man um 8 Uhr tippt 30s, um 12 Uhr -> 7s, 13 Uhr -> 3s, ab 13:37 dann 0s
  if (berlinDate.getHours() >= 0 && berlinDate.getHours() <= 7) {
    offset = 65
  } else if (berlinDate.getHours() >= 8 && berlinDate.getHours() <= 11) {
    offset = 30
  } else if (berlinDate.getHours() === 12) {
    offset = 7
  } else if (berlinDate.getHours() === 13) {
    offset = 3
  }
  return playTime + offset * 1000
}
