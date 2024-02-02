import sqlite3, { RunResult } from 'sqlite3'

/**
 * AsyncDatabase extends the sqlite3.Database with methods returning a Promise
 */
export class AsyncDatabase extends sqlite3.verbose().Database {
  private static readonly _instance = new Map<string, AsyncDatabase>()
  private static _defaultInstanceName: string | undefined

  /**
   * Opens a already existing database instance but does not create a new one
   * @param filename The path to the database file
   */
  static async open(): Promise<AsyncDatabase | undefined>
  /**
   * Opens a already existing database instance or creates a new one
   * @param filename The path to the database file (only used if an open database does not exist yet)
   */
  static async open(filename: string): Promise<AsyncDatabase>
  /**
   * Opens a already existing database instance or creates a new one
   * @param filename The path to the database file (only used if an open database does not exist yet)
   * @param mode The mode the database should be opened in (only used if an open database does not exist yet)
   */
  static async open(filename: string, mode: number): Promise<AsyncDatabase>

  static async open(filename?: string, mode?: number): Promise<AsyncDatabase | undefined> {
    if (filename === undefined) {
      if (AsyncDatabase._defaultInstanceName === undefined) {
        throw new Error('Database.open: no default instance name set')
      }
      return AsyncDatabase._instance.get(AsyncDatabase._defaultInstanceName)
    }
    if (AsyncDatabase._instance.get(filename) !== undefined) {
      return AsyncDatabase._instance.get(filename)
    }
    if (mode === undefined) {
      mode = sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE
    } else if (typeof mode !== 'number') {
      throw new TypeError('Database.open: mode is not a number')
    }
    if (AsyncDatabase._defaultInstanceName === undefined) {
      AsyncDatabase._defaultInstanceName = filename
    }
    return await new Promise<AsyncDatabase>((resolve, reject) => {
      const db = new AsyncDatabase(filename, mode, (err) => {
        if (err != null) {
          reject(err)
        } else {
          AsyncDatabase._instance.set(filename, db)
          resolve(db)
        }
      })
    })
  }

  async allAsyncT<T>(sql: string, params: any): Promise<T[]> {
    return await new Promise((resolve, reject) => {
      const callback = (err: Error | null, rows: T[]): void => {
        if (err != null) {
          reject(err)
        } else {
          resolve(rows)
        }
      }
      this.all(sql, params, callback)
    })
  }

  async allAsync(sql: string, params: any): Promise<any[]> {
    return await new Promise((resolve, reject) => {
      const callback = (err: Error | null, rows: any[]): void => {
        if (err != null) {
          reject(err)
        } else {
          resolve(rows)
        }
      }
      this.all(sql, params, callback)
    })
  }

  async getAsyncT<T>(sql: string, params: any): Promise<T> {
    return await new Promise((resolve, reject) => {
      const callback = (err: Error | null, rows: T): void => {
        if (err != null) {
          reject(err)
        } else {
          resolve(rows)
        }
      }
      this.get(sql, params, callback)
    })
  }

  async getAsync(sql: string, params: any): Promise<any> {
    return await new Promise((resolve, reject) => {
      const callback = (err: Error | null, rows: any[]): void => {
        if (err != null) {
          reject(err)
        } else {
          resolve(rows)
        }
      }
      this.get(sql, params, callback)
    })
  }

  async runAsync(sql: string): Promise<RunResult>
  async runAsync(sql: string, params: any): Promise<RunResult>

  async runAsync(sql: string, params?: any): Promise<RunResult> {
    return await new Promise((resolve, reject) => {
      function callback(this: RunResult, err: Error | null): void {
        if (err != null) {
          reject(err)
        } else {
          resolve(this)
        }
      }
      if (params !== undefined) {
        this.run(sql, params, callback)
      } else {
        this.run(sql, callback)
      }
    })
  }

  async serializeAsync(callback?: () => Promise<void>): Promise<void> {
    this.serialize(callback)
  }
}
