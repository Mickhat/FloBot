import { AsyncDatabase } from '../sqlite/sqlite'

export interface EliteGameRank {
  identifier: number
  rank: string
  player: string
  change_date: string
}

export interface EliteGame {
  identifier: number
  player: string
  register_date: string
  play_timestamp: number
}

export class EliteGameDataStorage {
  private static _instance: EliteGameDataStorage
  static instance(): EliteGameDataStorage {
    if (!EliteGameDataStorage._instance) {
      EliteGameDataStorage._instance = new EliteGameDataStorage()
    }
    return EliteGameDataStorage._instance
  }

  private db?: AsyncDatabase

  private constructor() {}

  public isInitEliteGame(): boolean {
    return this.db !== undefined
  }

  public async initEliteGame(_db: AsyncDatabase): Promise<void> {
    if (this.db) {
      throw Error('initEliteGame was already called!')
    }
    this.db = _db
    await this.db.runAsync(`CREATE TABLE IF NOT EXISTS elite_game (
      identifier INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL UNIQUE,
      player TEXT NOT NULL,
      register_date TEXT NOT NULL,
      play_timestamp INTEGER NOT NULL
    )`)
    await this.db.runAsync(`CREATE TABLE IF NOT EXISTS elite_game_winner (
      identifier INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL UNIQUE,
      player TEXT NOT NULL,
      register_date TEXT NOT NULL,
      play_timestamp INTEGER NOT NULL,
      target_timestamp INTEGER NOT NULL
    )`)
    await this.db.runAsync(`CREATE TABLE IF NOT EXISTS elite_game_rank (
      identifier INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL UNIQUE,
      rank TEXT NOT NULL,
      player TEXT NOT NULL,
      change_date TEXT NOT NULL
    )`)
  }

  public async loadRanks(): Promise<EliteGameRank[]> {
    if (!this.db) {
      throw Error('initEliteGame was not called!')
    }
    return await this.db.allAsyncT<EliteGameRank>(`select * from elite_game_rank`, [])
  }

  public async loadWinners(days: number, minWins: number, playerToExclude: string): Promise<Array<{ countRows: number, player: string }>> {
    if (!this.db) {
      throw Error('initEliteGame was not called!')
    }
    return await this.db.allAsyncT<{ countRows: number, player: string }>(`select count(identifier) as countRows, player from elite_game_winner where play_timestamp > ? and player != ? group by player having count(identifier) >= ? order by count(identifier) desc`,
      [Date.now() - days * 24 * 60 * 60 * 1000, playerToExclude, minWins])
  }

  public async loadLastWinner(): Promise<string | null> {
    if (!this.db) {
      throw Error('initEliteGame was not called!')
    }
    const winner = await this.db.getAsyncT<{ player: string }>(`select player from elite_game_winner order by play_timestamp desc limit 1`, [])
    return winner ? winner.player : null
  }

  public async writeGamePlay(userId: string, berlinDate: string): Promise<void> {
    if (!this.db) {
      throw Error('initEliteGame was not called!')
    }
    await this.db.runAsync(`INSERT INTO elite_game(register_date, player, play_timestamp) VALUES(?,?,?)`, [berlinDate, userId, Date.now()])
  }

  public async loadGamePlayForUser(userId: string, berlinDate: string): Promise<EliteGame[]> {
    if (!this.db) {
      throw Error('initEliteGame was not called!')
    }
    return await this.db.allAsyncT<EliteGame>(`select * from elite_game where register_date = ? and (player = ? or player = "\uFFFF") order by player desc`, [berlinDate, userId])
  }

  public async loadGamePlayAll(berlinDate: string): Promise<EliteGame[]> {
    if (!this.db) {
      throw Error('initEliteGame was not called!')
    }
    return await this.db.allAsyncT<EliteGame>(`select * from elite_game where register_date = ? and player != "\uFFFF" order by play_timestamp desc`, [berlinDate])
  }

  public async writeGameWinner(userId: string, berlinDate: string, playerTimestamp: number): Promise<void> {
    if (!this.db) {
      throw Error('initEliteGame was not called!')
    }
    await this.db.runAsync(`INSERT INTO elite_game_winner (player, register_date, play_timestamp, target_timestamp) VALUES(?,?,?,?)`, [userId, berlinDate, playerTimestamp, Date.now()])
  }

  public async writeGameRank(rank: string, userId: string): Promise<void> {
    if (!this.db) {
      throw Error('initEliteGame was not called!')
    }
    if ((await this.db.getAsyncT<{ count: number }>(`select count(*) as count from elite_game_rank where rank = ?`, [rank])).count > 0) {
      await this.db.runAsync(`UPDATE elite_game_rank set player = ?, change_date = ? where rank = ?`, [userId, new Date().toISOString(), rank])
    } else {
      await this.db.runAsync(`INSERT INTO elite_game_rank (rank, player, change_date) VALUES(?,?,?)`, [rank, userId, new Date().toISOString()])
    }
    await this.db.runAsync(`DELETE FROM elite_game_rank where rank != ? and player = ?`, [rank, userId])
  }

  public async loadWinnersStats(days: number): Promise<Array<{ userId: string, count: number }>> {
    if (!this.db) {
      throw Error('initEliteGame was not called!')
    }
    return await this.db.allAsyncT<{ userId: string, count: number }>(`select player as userId, count(identifier) as count from elite_game_winner where play_timestamp > ? group by player order by count(identifier) desc`,
      [Date.now() - days * 24 * 60 * 60 * 1000])
  }

  public async loadTodaysPlayers(): Promise<Array<{ userId: string }>> {
    if (!this.db) {
      throw Error('initEliteGame was not called!')
    }
    return await this.db.allAsyncT<{ userId: string }>(`select player as userId from elite_game where register_date = (select register_date from elite_game where identifier = (select max(identifier) from elite_game where player = "\uFFFF")) and player != "\uFFFF" order by play_timestamp desc`, [])
  }
}
