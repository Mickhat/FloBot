import fs from 'node:fs'
import { v4 as uuid } from 'uuid'
import { join } from 'node:path'
import { format as formatDate } from 'date-fns'
import { promisify } from 'util'

const appendFile = promisify(fs.appendFile)

interface ILogManager {
  logger: (name?: string) => Logger
  log: (type: IType, text: string) => Promise<void>
  logSync: (type: IType, text: string) => LogManager
  close: (message: string) => void
}

interface ILogger {
  log: (type: IType, text: string) => Promise<void>
  logSync: (type: IType, text: string) => Logger
}

type IType = 'WARN' | 'INFO' | 'DEBUG' | 'ERROR' | 'LOG'

const DATE_FORMAT_STR = 'dd MM yyyy HH:mm:ss'

class LogManager implements ILogManager {
  private static readonly DEFAULT_LOGGER_NAME = 'master'

  readonly filename: string

  constructor (path: string, name: string = uuid()) {
    this.filename = join(path, `${formatDate(new Date(), 'yyyy-MM-dd--HH-mm-ss')}--${name}.log`)
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path)
    }
    fs.writeFileSync(this.filename, `${formatDate(new Date(), DATE_FORMAT_STR)} Begin of log ${name}\n`)
  }

  logger (name?: string): Logger {
    if (name !== undefined) {
      return new Logger(this.filename, name)
    } else {
      return new Logger(this.filename, LogManager.DEFAULT_LOGGER_NAME)
    }
  }

  async log (type: IType, text: string): Promise<void> {
    return await this.logger(LogManager.DEFAULT_LOGGER_NAME).log(type, text)
  }

  logSync (type: IType, text: string): LogManager {
    this.logger(LogManager.DEFAULT_LOGGER_NAME).logSync(type, text)
    return this
  }

  close (message: string): void {
    fs.appendFileSync(this.filename, `Log closed at ${formatDate(new Date(), DATE_FORMAT_STR)} - ${message}`)
  }
}

class Logger implements ILogger {
  private readonly filename: string
  private readonly loggerName: string

  constructor (filename: string, logerName: string) {
    this.filename = filename
    this.loggerName = logerName
  }

  private buildLogStr (type: IType, text: string): string {
    return `${type} [${this.loggerName} ${formatDate(new Date(), DATE_FORMAT_STR)}] ${text}\n`
  }

  async log (type: IType, text: string): Promise<void> {
    const toLog = this.buildLogStr(type, text)
    console.log(toLog)
    return await appendFile(this.filename, toLog, { encoding: 'utf-8' })
  }

  logSync (type: IType, text: string): Logger {
    const toLog = this.buildLogStr(type, text)
    console.log(toLog)
    fs.appendFileSync(this.filename, toLog, { encoding: 'utf-8' })
    return this
  }
}

export {
  LogManager, Logger, ILogManager, ILogger, IType
}

export default LogManager
