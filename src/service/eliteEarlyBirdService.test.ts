import { expect, test } from '@jest/globals'
import { parse } from './eliteEarlyBirdService'

test('full time - at 13:37', async () => {
  const now = new Date()
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime()
  const result = parse('13:37:37.137')
  expect(result).toBeDefined()
  if (result) {
    expect(result - midnight).toBe(13 * 60 * 60 * 1000 + 37 * 60 * 1000 + 37 * 1000 + 137)
  }
})

test('full time - early morning', async () => {
  const now = new Date()
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime()
  const result = parse('2:37:37.137')
  expect(result).toBeDefined()
  if (result) {
    expect(result - midnight).toBe(2 * 60 * 60 * 1000 + 37 * 60 * 1000 + 37 * 1000 + 137)
  }
})

test('full time - early morning - single digits', async () => {
  const now = new Date()
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime()
  const result = parse('2:02:02.1')
  expect(result).toBeDefined()
  if (result) {
    expect(result - midnight).toBe(2 * 60 * 60 * 1000 + 2 * 60 * 1000 + 2 * 1000 + 100)
  }
})

test('time without millis - early morning - single digits', async () => {
  const now = new Date()
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime()
  const result = parse('2:02:02')
  expect(result).toBeDefined()
  if (result) {
    expect(result - midnight).toBe(2 * 60 * 60 * 1000 + 2 * 60 * 1000 + 2 * 1000)
  }
})

test('time without hour - single digits', async () => {
  const now = new Date()
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime()
  const result = parse('2:02')
  expect(result).toBeDefined()
  if (result) {
    expect(result - midnight).toBe(13 * 60 * 60 * 1000 + 2 * 60 * 1000 + 2 * 1000)
  }
})

test('time just in seconcs', async () => {
  const now = new Date()
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime()
  const result = parse('37')
  expect(result).toBeDefined()
  if (result) {
    expect(result - midnight).toBe(13 * 60 * 60 * 1000 + 37 * 60 * 1000 + 37 * 1000)
  }
})

test('time just in seconcs and millis(3 digit pending 0)', async () => {
  const now = new Date()
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime()
  const result = parse('3.370')
  expect(result).toBeDefined()
  if (result) {
    expect(result - midnight).toBe(13 * 60 * 60 * 1000 + 37 * 60 * 1000 + 3 * 1000 + 370)
  }
})

test('time just in seconcs and millis(2 digits)', async () => {
  const now = new Date()
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime()
  const result = parse('3.37')
  expect(result).toBeDefined()
  if (result) {
    expect(result - midnight).toBe(13 * 60 * 60 * 1000 + 37 * 60 * 1000 + 3 * 1000 + 370)
  }
})

test('time just in seconcs and millis(3 digits, leading 0)', async () => {
  const now = new Date()
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime()
  const result = parse('3.037')
  expect(result).toBeDefined()
  if (result) {
    expect(result - midnight).toBe(13 * 60 * 60 * 1000 + 37 * 60 * 1000 + 3 * 1000 + 37)
  }
})
