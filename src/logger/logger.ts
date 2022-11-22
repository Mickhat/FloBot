import fs from 'node:fs'
import { v4 as uuid } from 'uuid'
import { join } from 'node:path'
import { format as formatDate } from 'date-fns'

interface LogManager {
  filename: string
}

interface Logger {
  filename: string
  logerName: string
}

class LogManager {
  constructor (path: string, name: string = uuid()) {
    this.filename = join(path, `${formatDate(new Date(), 'yyyy-MM-dd--HH-mm')}--${name}.log`)
    if (!fs.existsSync(path)) fs.mkdirSync(path)
    fs.writeFileSync(this.filename, `${formatDate(new Date(), 'dd MM yyyy HH:mm:ss')} Begin of log ${name}\n`)
  }

  logger (name: string): Logger {
    return new Logger(this.filename, name)
  }

  async log (type: 'WARN' | 'INFO' | 'DEBUG' | 'ERROR' | 'LOG' | string, text: string): Promise<void> {
    return await new Promise<void>((resolve, reject) => {
      text = `${type} [master ${formatDate(new Date(), 'dd MM yyyy HH:mm:ss')}] ${text}\n`
      console.log(text)
      fs.appendFile(this.filename, text, { encoding: 'utf-8' }, (err) => {
        if (err != null) {
          reject(err)
        } else resolve()
      })
    })
  }

  logSync (type: 'WARN' | 'INFO' | 'DEBUG' | 'ERROR' | 'LOG' | string, text: string): LogManager {
    text = `${type} [master ${formatDate(new Date(), 'dd MM yyyy HH:mm:ss')}] ${text}\n`
    console.log(text)
    fs.appendFileSync(this.filename, text, { encoding: 'utf-8' })
    return this
  }

  close (message: string): void {
    fs.appendFileSync(this.filename, `Log closed at ${formatDate(new Date(), 'dd MM yyyy HH:mm:ss')}; ${message}`)
  }
}

class Logger {
  constructor (filename: string, logerName: string) {
    this.filename = filename
    this.logerName = logerName
  }

  async log (type: 'WARN' | 'INFO' | 'DEBUG' | 'ERROR' | 'LOG' | string, text: string): Promise<void> {
    return await new Promise<void>((resolve, reject) => {
      text = `${type} [${this.logerName} ${formatDate(new Date(), 'dd MM yyyy HH:mm:ss')}] ${text}\n`
      console.log(text)
      fs.appendFile(this.filename, text, { encoding: 'utf-8' }, (err) => {
        if (err != null) {
          reject(err)
        } else resolve()
      })
    })
  }

  logSync (type: 'WARN' | 'INFO' | 'DEBUG' | 'ERROR' | 'LOG' | string, text: string): Logger {
    text = `${type} [${this.logerName} ${formatDate(new Date(), 'dd MM yyyy HH:mm:ss')}] ${text}\n`
    console.log(text)
    fs.appendFileSync(this.filename, text, { encoding: 'utf-8' })
    return this
  }
}

export {
  LogManager, Logger
}

export default LogManager
