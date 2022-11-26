import { expect, test } from '@jest/globals'
import { LogManager, FileConsoleLogger } from './logger'
import fs from 'fs'

test('alround logging test', async () => {
  const logManager = LogManager.getInstance().logger()
  logManager.logSync('WARN', 'this-is-a-very-special-string-to-be-logged-and-checked')
  await logManager.log('WARN', 'another-message-to-check')
  expect(fs.existsSync(FileConsoleLogger.filename ?? 'FILENAME_NOT_SET')).toBeTruthy()
  const fdr = fs.readFileSync(FileConsoleLogger.filename ?? 'FILENAME_NOT_SET', 'utf8')
  expect(fdr).toContain('this-is-a-very-special-string-to-be-logged-and-checked')
  expect(fdr).toContain('another-message-to-check')
})

test('all levels test', async () => {
  const logManager = LogManager.getInstance().logger()
  await logManager.log('WARN', 'nraw')
  await logManager.log('INFO', 'ofni')
  await logManager.log('DEBUG', 'gubed')
  await logManager.log('ERROR', 'rorre')
  await logManager.log('LOG', 'gol')
  expect(fs.existsSync(FileConsoleLogger.filename ?? 'FILENAME_NOT_SET')).toBeTruthy()
  const fdr = fs.readFileSync(FileConsoleLogger.filename ?? 'FILENAME_NOT_SET', 'utf8')
  expect(fdr).toContain('WARN')
  expect(fdr).toContain('INFO')
  expect(fdr).toContain('DEBUG')
  expect(fdr).toContain('ERROR')
  expect(fdr).toContain('LOG')
  expect(fdr).toContain('nraw')
  expect(fdr).toContain('ofni')
  expect(fdr).toContain('gubed')
  expect(fdr).toContain('rorre')
  expect(fdr).toContain('gol')
})

test('another logger name test', async () => {
  const logManager = LogManager.getInstance().logger('another-logger-name')
  await logManager.log('LOG', 'logging message')
  expect(fs.existsSync(FileConsoleLogger.filename ?? 'FILENAME_NOT_SET')).toBeTruthy()
  const filteredContent = fs
    .readFileSync(FileConsoleLogger.filename ?? 'FILENAME_NOT_SET', 'utf8')
    .split('\n').find(e => e.match(/LOG \[another-logger-name.*\] logging message/))
  const found = filteredContent !== undefined && filteredContent.length > 0
  expect(found).toBeTruthy()
})
