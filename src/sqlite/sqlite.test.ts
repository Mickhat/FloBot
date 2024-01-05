import { expect, test } from '@jest/globals'
import { AsyncDatabase } from './sqlite'
import os from 'os'
import fs from 'fs'

const createDBName = (num: number): string => {
  return `${os.tmpdir()}/test-sqlite-${num}.db`
}

const unlink = (num: number): void => {
  // windows has problem with unlinkSync (possibly due to Anti-Virus)
  fs.unlink(createDBName(num), (err) => {
  	if (err) throw err;
  })
}

test('open DB', async () => {
  const db = await AsyncDatabase.open(createDBName(0))
  expect(db).toBeDefined()
  expect(fs.existsSync(createDBName(0))).toBeTruthy()
  await db.close()
  unlink(0)
})

test('create table', async () => {
  const db = await AsyncDatabase.open(createDBName(1))
  const runResult = await db.runAsync('create table if not exists foo (id int, name varchar(255))')
  expect(runResult.changes).toBe(0)
  expect(runResult.lastID).toBe(0)
  await db.close()
  unlink(1)
})

test('insert', async () => {
  const db = await AsyncDatabase.open(createDBName(2))
  await db.runAsync('create table if not exists foo (id int, name varchar(255))')
  const runResult = await db.runAsync('insert into foo (id, name) values (?,?)', [1, 'mega'])
  expect(runResult.changes).toBe(1)
  expect(runResult.lastID).toBe(1)
  const runResult2 = await db.runAsync('insert into foo (id, name) values (?,?)', [2, 'giga'])
  expect(runResult2.changes).toBe(1)
  expect(runResult2.lastID).toBe(2)
  await db.close()
  unlink(2)
})

test('query', async () => {
  const db = await AsyncDatabase.open(createDBName(3))
  await db.runAsync('create table if not exists foo (id int, name varchar(255))')
  await db.runAsync('delete from foo', [])
  await db.runAsync('insert into foo (id, name) values (?,?), (?,?), (?,?)', [1, 'mega', 2, 'giga', 3, 'exa'])
  const all = await db.allAsync('select * from foo order by id', [])
  expect(all.length).toBe(3)
  expect(all[0].id).toBe(1)
  expect(all[1].id).toBe(2)
  expect(all[2].id).toBe(3)
  expect(all[0].name).toBe('mega')
  expect(all[1].name).toBe('giga')
  expect(all[2].name).toBe('exa')
  const one = await db.getAsync('select * from foo where id = ?', [1])
  expect(one.id).toBe(1)
  expect(one.name).toBe('mega')
  await db.close()
  unlink(3)
})
