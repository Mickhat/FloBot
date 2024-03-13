
export function parse(dateToParse: string | number | boolean): undefined | number {
  if (typeof dateToParse !== 'string') {
    return undefined
  }
  const now = new Date()
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime()
  if (/^\d{1,2}:\d{1,2}:\d{1,2}\.\d{1,3}$/g.test(dateToParse)) {
    const splitByColon = dateToParse.split(':')
    if (splitByColon.length !== 3) {
      return undefined
    }
    const hours = parseInt(splitByColon[0])
    const minutes = parseInt(splitByColon[1])
    const seconds = parseFloat(splitByColon[2])
    if (hours < 0 || hours > 23) {
      return undefined
    }
    if (minutes < 0 || minutes > 59) {
      return undefined
    }
    if (seconds < 0 || seconds >= 60) {
      return undefined
    }
    return midnight + (seconds * 1000) + (minutes * 60 * 1000) + (hours * 60 * 60 * 1000)
  }
  if (/^\d{1,2}:\d{1,2}:\d{1,2}$/g.test(dateToParse)) {
    const splitByColon = dateToParse.split(':')
    if (splitByColon.length !== 3) {
      return undefined
    }
    const hours = parseInt(splitByColon[0])
    const minutes = parseInt(splitByColon[1])
    const seconds = parseInt(splitByColon[2])
    if (hours < 0 || hours > 23) {
      return undefined
    }
    if (minutes < 0 || minutes > 59) {
      return undefined
    }
    if (seconds < 0 || seconds > 59) {
      return undefined
    }
    return midnight + (seconds * 1000) + (minutes * 60 * 1000) + (hours * 60 * 60 * 1000)
  }
  if (/^\d{1,2}:\d{1,2}$/g.test(dateToParse)) {
    const splitByColon = dateToParse.split(':')
    if (splitByColon.length !== 2) {
      return undefined
    }
    const minutes = parseInt(splitByColon[0])
    const seconds = parseInt(splitByColon[1])
    if (minutes < 0 || minutes > 59) {
      return undefined
    }
    if (seconds < 0 || seconds > 59) {
      return undefined
    }
    return midnight + (seconds * 1000) + (minutes * 60 * 1000) + (13 * 60 * 60 * 1000)
  }
  if (/^\d{1,2}\.\d{1,3}$/g.test(dateToParse)) {
    const seconds = parseFloat(dateToParse)
    if (seconds < 0 || seconds >= 60) {
      return undefined
    }
    return midnight + (seconds * 1000) + (37 * 60 * 1000) + (13 * 60 * 60 * 1000)
  }
  if (/^\d{1,2}$/g.test(dateToParse)) {
    const seconds = parseInt(dateToParse)
    if (seconds < 0 || seconds > 59) {
      return undefined
    }
    return midnight + seconds * 1000 + (37 * 60 * 1000) + (13 * 60 * 60 * 1000)
  }
  return undefined
}

export function calcValidFrom(playTime: number): number {
  const now = new Date()
  let offset = 999
  // rules: Mitternacht tippt sind es 65s, wenn man um 8 Uhr tippt 30s, um 12 Uhr -> 7s, 13 Uhr -> 3s, ab 13:37 dann 0s
  if (now.getHours() >= 0 && now.getHours() <= 7) {
    offset = 65
  } else if (now.getHours() >= 8 && now.getHours() <= 11) {
    offset = 30
  } else if (now.getHours() === 12) {
    offset = 7
  } else if (now.getHours() === 13) {
    offset = 3
  }
  return playTime + offset * 1000
}
