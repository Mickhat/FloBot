import { expect, test, beforeAll, afterAll } from '@jest/globals'
import { AsyncDatabase } from '../../sqlite/sqlite'
import { PersistentDataStorage } from './persistentDataStorage'
import os from 'os'
import fs from 'fs'

beforeAll(async () => {
  const db = await AsyncDatabase.open(`${os.tmpdir()}/test-sqlite-bj.db`)
  const store = await PersistentDataStorage.instance()
  await store.initBlackJack(db)
})
afterAll(() => {
  fs.unlink(`${os.tmpdir()}/test-sqlite-bj.db`, () => {})
})

test('get empty', async () => {
  const store = await PersistentDataStorage.instance()
  const userTag = `userid001${Math.random()}`
  const element = await store.load(userTag)
  expect(element.userTag).toBe(userTag)
  expect(element.betId).toBeUndefined()
})

test('save', async () => {
  const store = await PersistentDataStorage.instance()
  const userTag = `userid001${Math.random()}`
  const element = await store.load(userTag)
  element.betId = 100
  await store.save(element)
  const loaded = await store.load(userTag)
  expect(loaded.userTag).toBe(userTag)
  expect(loaded.betId).toBe(100)
})

test('cleanup', async () => {
  const store = await PersistentDataStorage.instance()
  const userTag = `userid001${Math.random()}`
  const element = await store.load(userTag)
  element.betId = 100
  await store.save(element)
  await store.cleanup(element.userTag, -1)
  const loaded = await store.load(userTag)
  expect(loaded.userTag).toBe(userTag)
  expect(loaded.betId).toBe(0)
})
