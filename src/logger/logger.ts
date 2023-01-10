import fs from 'node:fs'
import { v4 as uuid } from 'uuid'
import { join } from 'node:path'
import { format as formatDate } from 'date-fns'
import { promisify } from 'util'

const appendFile = promisify(fs.appendFile)

/**
 * Logging backend independent interface. Should be used throughout the application to log.
 */
interface ILogger {
  log: (type: ILoggingLevel, text: string) => Promise<void>
  logSync: (type: ILoggingLevel, text: string) => ILogger
}

/**
 * logging levels in order
 */
type ILoggingLevel = 'LOG' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'

const DATE_FORMAT_STR = 'dd MM yyyy HH:mm:ss'

/**
 * Structur of the logging.json config file
 */
interface ILoggingConfig {
  data: any
  loggerImplementation: string
  minLevel: ILoggingLevel
}

/**
 * Class used to aquire an instance of ILogger. This application uses ./logging.json to find the right logging backend.
 */
class LogManager {
  private static readonly singleton: LogManager = new LogManager()

  public static getInstance (): LogManager {
    return LogManager.singleton
  }

  private static readonly DEFAULT_LOGGER_NAME = 'master'

  readonly config: ILoggingConfig

  private constructor () {
    const loggingConfig = JSON.parse(fs.readFileSync('./logging.json', 'utf8')) as ILoggingConfig
    this.config = loggingConfig
  }

  /**
   * Returns an ILogger for the configured backend and the specified logger name
   *
   * @param name a logger name, can be any string
   * @returns an instance of ILogger
   */
  logger (name?: string): ILogger {
    // eslint-disable-next-line no-eval
    return eval(`new ${this.config.loggerImplementation}(this.config.data, name ?? LogManager.DEFAULT_LOGGER_NAME, this.config.minLevel)`)
  }
}

/**
 * A logging backend using both file and console to log messages.
 */
class FileConsoleLogger implements ILogger {
  static filename?: string
  private readonly configData: any
  private readonly loggerName: string
  private readonly minLevel: ILoggingLevel

  constructor (configData: any, logerName: string, minLevel: ILoggingLevel) {
    this.configData = configData
    this.loggerName = logerName
    this.minLevel = minLevel
    const path = configData.path
    if (!FileConsoleLogger.filename) {
      const name = uuid()
      FileConsoleLogger.filename = join(path, `${formatDate(new Date(), 'yyyy-MM-dd--HH-mm-ss')}--${name}.log`)
      if (!fs.existsSync(path)) {
        fs.mkdirSync(path)
      }
      fs.writeFileSync(FileConsoleLogger.filename, `${formatDate(new Date(), DATE_FORMAT_STR)} Begin of log ${name}\n`)
    }
  }

  private filter (type: ILoggingLevel): boolean {
    switch (this.minLevel) {
      case 'LOG':
        return true
      case 'DEBUG':
        return type !== 'LOG'
      case 'INFO':
        return type !== 'LOG' && type !== 'DEBUG'
      case 'WARN':
        return type === 'ERROR' || type === 'WARN'
      case 'ERROR':
        return type === 'ERROR'
    }
    return false
  }

  private buildLogStr (type: ILoggingLevel, text: string): string {
    return `${type} [${this.loggerName} ${formatDate(new Date(), DATE_FORMAT_STR)}] ${text}\n`
  }

  async log (type: ILoggingLevel, text: string): Promise<void> {
    if (this.filter(type)) {
      const toLog = this.buildLogStr(type, text)
      console.log(toLog)
      await appendFile(FileConsoleLogger.filename as string, toLog, { encoding: 'utf-8' })
    }
  }

  logSync (type: ILoggingLevel, text: string): ILogger {
    if (this.filter(type)) {
      const toLog = this.buildLogStr(type, text)
      console.log(toLog)
      fs.appendFileSync(FileConsoleLogger.filename as string, toLog, { encoding: 'utf-8' })
    }
    return this
  }
}

export {
  LogManager, ILogger, ILoggingLevel as IType, FileConsoleLogger
}

export default LogManager
