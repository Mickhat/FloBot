import { AsyncDatabase } from '../../sqlite/sqlite'

export interface IGameData {
  userTag: string
  playerId?: number
  deckId?: number
  gameId?: number
  betId?: number
  secondBetId?: number
  followActions: string
  secondBetFollowActions?: string
  lastUpdateDate: Date | string
}

export class PersistentDataStorage {
  private static _instance: PersistentDataStorage
  static async instance (): Promise<PersistentDataStorage> {
    if (!PersistentDataStorage._instance) {
      PersistentDataStorage._instance = new PersistentDataStorage()
    }
    return PersistentDataStorage._instance
  }

  private db?: AsyncDatabase

  private constructor () {
  }

  public async initBlackJack (_db: AsyncDatabase): Promise<void> {
    if (this.db) {
      throw Error("initBlackJack was already called!")
    }
    this.db = _db
    await this.db.runAsync(`CREATE TABLE IF NOT EXISTS gameDataBlackJack (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL UNIQUE,
      userTag TEXT NOT NULL UNIQUE,
      playerId INTEGER NULL,
      deckId INTEGER NULL,
      gameId INTEGER NULL,
      betId INTEGER NULL,
      secondBetId INTEGER NULL,
      followActions VARCHAR NULL,
      secondBetFollowActions VARCHAR NULL,
      lastUpdateDate TEXT NOT NULL
      )`)
  }

  public async load (userTag: string): Promise<IGameData> {
    if (!this.db) {
      throw Error("initBlackJack never initialized!")
    }
    let row: IGameData | undefined = await this.db.getAsync('SELECT * FROM gameDataBlackJack WHERE userTag = ?', userTag)
    if (row) {
      // sqlite has not date/time support. the date is stored as a string in format "2022-12-04 22:12:46", but in UTC without Z at the end
      row.lastUpdateDate = new Date(`${row.lastUpdateDate as string}Z`)
      if ((row.lastUpdateDate.getTime() + (1000 * 60 * 55)) < new Date().getTime()) { // remove after 55 minutes
        row = {
          userTag,
          followActions: '',
          lastUpdateDate: new Date()
        }
        await this.cleanup(userTag, -1)
      }
    } else {
      row = {
        userTag,
        followActions: '',
        lastUpdateDate: new Date()
      }
      await this.db.run('INSERT INTO gameDataBlackJack (userTag, lastUpdateDate) VALUES (?, datetime(\'now\'))', userTag)
    }
    return row
  }

  public async save (storeElement: IGameData): Promise<void> {
    if (!this.db) {
      throw Error("initBlackJack never initialized!")
    }
    await this.db.runAsync('UPDATE gameDataBlackJack SET playerId=?, deckId=?, gameId=?, betId=?, secondBetId=?, followActions=?, secondBetFollowActions=? WHERE userTag = ?',
      [storeElement.playerId, storeElement.deckId, storeElement.gameId, storeElement.betId, storeElement.secondBetId, storeElement.followActions, storeElement.secondBetFollowActions, storeElement.userTag])
  }

  public async cleanup (userTag: string, cash: number): Promise<void> {
    if (!this.db) {
      throw Error("initBlackJack never initialized!")
    }
    if (cash === -1) {
      await this.db.runAsync('UPDATE gameDataBlackJack SET deckId=0, playerId=0, gameId=0, betId=0, secondBetId=0, followActions=null, secondBetFollowActions=null, lastUpdateDate=datetime(\'now\') WHERE userTag = ?', userTag)
    } else if (cash === 0) {
      await this.db.runAsync('UPDATE gameDataBlackJack SET playerId=0, gameId=0, betId=0, secondBetId=0, followActions=null, secondBetFollowActions=null, lastUpdateDate=datetime(\'now\') WHERE userTag = ?', userTag)
    } else {
      await this.db.runAsync('UPDATE gameDataBlackJack SET gameId=0, betId=0, secondBetId=0, followActions=null, secondBetFollowActions=null, lastUpdateDate=datetime(\'now\') WHERE userTag = ?', userTag)
    }
  }
}
