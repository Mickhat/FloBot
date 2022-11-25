import { expect, test } from '@jest/globals'
import { LogManager } from './logger'
import fs from 'fs'

test('alround logging test', async () => {
  const logManager = new LogManager('./')
  logManager.logSync('WARN', 'this-is-a-very-special-string-to-be-logged-and-checked')
  await logManager.log('WARN', 'another-message-to-check')
  logManager.close('close')
  expect(fs.existsSync(logManager.filename)).toBeTruthy()
  const fdr = fs.readFileSync(logManager.filename, 'utf8')
  expect(fdr).toContain('this-is-a-very-special-string-to-be-logged-and-checked')
  expect(fdr).toContain('another-message-to-check')
})

test('all levels test', async () => {
  const logManager = new LogManager('./')
  await logManager.log('WARN', 'nraw')
  await logManager.log('INFO', 'ofni')
  await logManager.log('DEBUG', 'gubed')
  await logManager.log('ERROR', 'rorre')
  await logManager.log('LOG', 'gol')
  logManager.close('close')
  expect(fs.existsSync(logManager.filename)).toBeTruthy()
  const fdr = fs.readFileSync(logManager.filename, 'utf8')
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
  const logManager = new LogManager('./')
  await logManager.logger('another-logger-name').log('LOG', 'logging message')
  logManager.close('close')
  expect(fs.existsSync(logManager.filename)).toBeTruthy()
  const filteredContent = fs
    .readFileSync(logManager.filename, 'utf8')
    .split('\n').find(e => e.match(/LOG \[another-logger-name.*\] logging message/))
  const found = filteredContent !== undefined && filteredContent.length > 0
  expect(found).toBeTruthy()
})
