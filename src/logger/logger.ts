import fs from 'node:fs';
import {v4 as uuid} from 'uuid';
import { join } from 'node:path';

import { format as formatDate } from 'date-fns';

interface LogManager {
    filename: string
}

interface Logger {
    filename: string,
    logerName: string,
}

class LogManager {
    constructor(path:string, name:string = uuid()) {
        this.filename = join(path, `${formatDate(new Date(), 'yyyy-MM-dd--HH-mm')}--${name}.log`)
        fs.writeFileSync(this.filename, `${formatDate(new Date(), 'dd MM yyyy HH:mm:ss')} Begin of log ${name}\n`)
    }
    logger(name:string) {
        return new Logger(this.filename, name)
    }
    async log<Promise>(type: "WARN" | "INFO" | "DEBUG" | "ERROR" | "LOG" | string,text: string) {
        return new Promise<void>(async (acc, dec) => {
            text = `${type} [master ${formatDate(new Date(), 'dd MM yyyy HH:mm:ss')}] ${text}`
            console.log(text)
            fs.appendFile(this.filename, text, { encoding: 'utf-8' }, (err) => {
                if (err) {
                    dec(err)
                }
                else acc()
            })
        })
    }
    logSync<LogManager>(type: "WARN" | "INFO" | "DEBUG" | "ERROR" | "LOG" | string, text: string) {
        text = `${type} [master ${formatDate(new Date(), 'dd MM yyyy HH:mm:ss')}] ${text}`
        console.log(text)
        fs.appendFileSync(this.filename, text, { encoding: 'utf-8'})
        return this;
    }

    close(message: string) {
        fs.appendFileSync(this.filename, `Log closed at ${formatDate(new Date(), 'dd MM yyyy HH:mm:ss')}; ${message}`)
    }
    
}

class Logger {
    constructor(filename: string, logerName: string) {
        this.filename = filename;
        this.logerName = logerName;
    }
    async log<Promise>(type: "WARN" | "INFO" | "DEBUG" | "ERROR" | "LOG" | string,text: string) {
        return new Promise<void>(async (acc, dec) => {
            text = `${type} [${this.logerName} ${formatDate(new Date(), 'dd MM yyyy HH:mm:ss')}] ${text}`
            console.log(text)
            fs.appendFile(this.filename, text, { encoding: 'utf-8' }, (err) => {
                if (err) {
                    dec(err)
                }
                else acc()
            })
        })
    }
    logSync<Logger>(type: "WARN" | "INFO" | "DEBUG" | "ERROR" | "LOG" | string,text: string) {
        text = `${type} [${this.logerName} ${formatDate(new Date(), 'dd MM yyyy HH:mm:ss')}] ${text}`
        console.log(text)
        fs.appendFileSync(this.filename, text, { encoding: 'utf-8'})
        return this;
    }
}

export {
    LogManager, Logger
};

export default LogManager;