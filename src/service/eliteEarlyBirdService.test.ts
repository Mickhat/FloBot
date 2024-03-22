import { expect, test } from '@jest/globals'
import { parse } from './eliteEarlyBirdService'
import moment = require('moment-timezone')

test('full time - at 13:37', async () => {
  const result = parse('13:37:37.137')
  expect(result).toBeDefined()
  if (result) {
    expect(result).toBe(moment.tz('13:37:37.137', 'hh:mm:ss.SSS', 'Europe/Berlin').valueOf())
  }
})

test('full time - early morning', async () => {
  const result = parse('2:37:37.137')
  expect(result).toBeDefined()
  if (result) {
    expect(result).toBe(moment.tz('02:37:37.137', 'hh:mm:ss.SSS', 'Europe/Berlin').valueOf())
  }
})

test('full time - early morning - single digits', async () => {
  const result = parse('2:02:02.1')
  expect(result).toBeDefined()
  if (result) {
    expect(result).toBe(moment.tz('02:02:02.100', 'hh:mm:ss.SSS', 'Europe/Berlin').valueOf())
  }
})

test('time without millis - early morning - single digits', async () => {
  const result = parse('2:02:02')
  expect(result).toBeDefined()
  if (result) {
    expect(result).toBe(moment.tz('02:02:02', 'hh:mm:ss', 'Europe/Berlin').valueOf())
  }
})

test('time without hour - single digits', async () => {
  const result = parse('2:02')
  expect(result).toBeDefined()
  if (result) {
    expect(result).toBe(moment.tz('13:02:02', 'hh:mm:ss', 'Europe/Berlin').valueOf())
  }
})

test('time just in seconcs', async () => {
  const result = parse('37')
  expect(result).toBeDefined()
  if (result) {
    expect(result).toBe(moment.tz('13:37:37', 'hh:mm:ss', 'Europe/Berlin').valueOf())
  }
})

test('time just in seconcs and millis(3 digit pending 0)', async () => {
  const result = parse('3.370')
  expect(result).toBeDefined()
  if (result) {
    expect(result).toBe(moment.tz('13:37:03.370', 'hh:mm:ss.SSS', 'Europe/Berlin').valueOf())
  }
})

test('time just in seconcs and millis(2 digits)', async () => {
  const result = parse('3.37')
  expect(result).toBeDefined()
  if (result) {
    expect(result).toBe(moment.tz('13:37:03.37', 'hh:mm:ss.SS', 'Europe/Berlin').valueOf())
  }
})

test('time just in seconcs and millis(3 digits, leading 0)', async () => {
  const result = parse('3.037')
  expect(result).toBeDefined()
  if (result) {
    expect(result).toBe(moment.tz('13:37:03.037', 'hh:mm:ss.SSS', 'Europe/Berlin').valueOf())
  }
})
