import { expect, test } from '@jest/globals'
import promotionService, { RANKS, getTodayAsDate } from './promotionService'
import { AsyncDatabase } from '../sqlite/sqlite'
import os from 'os'
import { EliteGameDataStorage } from './eliteGameDataStorage'

let db: AsyncDatabase | undefined

function getDate(daysAgo: number): string {
  const date = new Date()
  // subtract daysAgo in days from date
  date.setDate(date.getDate() - daysAgo)
  return getTodayAsDate(date)
}

function getMillisForDate (date: string): number {
  return new Date(date.split('.').reverse().join('-')).getTime() + 49020000 // add 13h37m
}

async function createEliteGameWinner(userId: string, date: string): Promise<void> {
  await db?.runAsync('insert into elite_game_winner (player, register_date, play_timestamp, target_timestamp) values (?,?,?,?)', [userId, date, getMillisForDate(date), getMillisForDate(date)])
}

const createDBName = (): string => {
  return `${os.tmpdir()}/test-sqlite-${Math.random()}.db`
}

async function init(): Promise<void> {
  if (!EliteGameDataStorage.instance().isInitEliteGame()) {
    db = await AsyncDatabase.open(createDBName())
    await EliteGameDataStorage.instance().initEliteGame(db)
  }
  await db?.runAsync('delete from elite_game_rank', [])
  await db?.runAsync('delete from elite_game_winner', [])
}

test('find rank', async () => {
  const data = [
    { rank: RANKS.GENERAL, player: '1', change_date: '1.1.2000', identifier: 3 },
    { rank: RANKS.COMMANDER, player: '2', change_date: '1.1.2000', identifier: 1 },
    { rank: RANKS.SERGEANT, player: '3', change_date: '1.1.2000', identifier: 2 }
  ]
  expect(promotionService.findRank(RANKS.GENERAL, data)).toBe('1')
  expect(promotionService.findRank(RANKS.COMMANDER, data)).toBe('2')
  expect(promotionService.findRank(RANKS.SERGEANT, data)).toBe('3')
})

test('getCurrentRanks', async () => {
  await init()

  await db?.runAsync('insert into elite_game_rank (rank, player, change_date) values (?,?,?)', [RANKS.GENERAL, '1', '01.01.2000'])
  await db?.runAsync('insert into elite_game_rank (rank, player, change_date) values (?,?,?)', [RANKS.COMMANDER, '2', '01.01.2000'])
  await db?.runAsync('insert into elite_game_rank (rank, player, change_date) values (?,?,?)', [RANKS.SERGEANT, '3', '01.01.2000'])

  const ranks = await promotionService.getCurrentRanks()

  expect((ranks).general).toBe('1')
  expect((ranks).commander).toBe('2')
  expect((ranks).sergeant).toBe('3')
})

test('getCurrentRanks no ranks available', async () => {
  await init()

  const ranks = await promotionService.getCurrentRanks()

  expect((ranks).general).toBe(null)
  expect((ranks).commander).toBe(null)
  expect((ranks).sergeant).toBe(null)
})

test('getTopWinner - first time - sergeant', async () => {
  await init()

  await createEliteGameWinner('1', getDate(0))

  const { general, commander, sergeant } = await promotionService.doPromotions()
  expect(sergeant).toBe('1')
  expect(commander).toBe(null)
  expect(general).toBe(null)
  expect(await promotionService.getCurrentRanks()).toEqual({ general: null, commander: null, sergeant: '1' })
})

test('getTopWinner - second time - commander promotion', async () => {
  await init()

  await db?.runAsync('insert into elite_game_rank (rank, player, change_date) values (?,?,?)', [RANKS.SERGEANT, '1', getDate(1)])
  await createEliteGameWinner('1', getDate(1))
  await createEliteGameWinner('1', getDate(0))

  const { general, commander, sergeant } = await promotionService.doPromotions()
  expect(commander).toBe('1')
  expect(sergeant).toBe(null)
  expect(general).toBe(null)
  expect(await promotionService.getCurrentRanks()).toEqual({ general: null, commander: '1', sergeant: null })
})

test('getTopWinner - third time - general promotion', async () => {
  await init()

  await db?.runAsync('insert into elite_game_rank (rank, player, change_date) values (?,?,?)', [RANKS.COMMANDER, '1', getDate(1)])
  await createEliteGameWinner('1', getDate(2))
  await createEliteGameWinner('1', getDate(1))
  await createEliteGameWinner('1', getDate(0))

  const { general, commander, sergeant } = await promotionService.doPromotions()
  expect(general).toBe('1')
  expect(commander).toBe(null)
  expect(sergeant).toBe(null)
  expect(await promotionService.getCurrentRanks()).toEqual({ general: '1', commander: null, sergeant: null })
})

test('getTopWinner - 4th time - no general promotion', async () => {
  await init()

  await db?.runAsync('insert into elite_game_rank (rank, player, change_date) values (?,?,?)', [RANKS.GENERAL, '1', getDate(1)])
  await createEliteGameWinner('1', getDate(3))
  await createEliteGameWinner('1', getDate(2))
  await createEliteGameWinner('1', getDate(1))
  await createEliteGameWinner('1', getDate(0))

  const { general, commander, sergeant } = await promotionService.doPromotions()
  expect(general).toBe(null)
  expect(commander).toBe(null)
  expect(sergeant).toBe(null)
  expect(await promotionService.getCurrentRanks()).toEqual({ general: '1', commander: null, sergeant: null })
})

test('getTopWinner - 9th time - sergeant promotion', async () => {
  await init()

  await db?.runAsync('insert into elite_game_rank (rank, player, change_date) values (?,?,?)', [RANKS.GENERAL, '1', getDate(1)])
  await db?.runAsync('insert into elite_game_rank (rank, player, change_date) values (?,?,?)', [RANKS.COMMANDER, '2', getDate(1)])
  await db?.runAsync('insert into elite_game_rank (rank, player, change_date) values (?,?,?)', [RANKS.SERGEANT, '3', getDate(1)])
  await createEliteGameWinner('1', getDate(8))
  await createEliteGameWinner('1', getDate(7))
  await createEliteGameWinner('1', getDate(6))
  await createEliteGameWinner('2', getDate(5))
  await createEliteGameWinner('2', getDate(4))
  await createEliteGameWinner('1', getDate(3))
  await createEliteGameWinner('2', getDate(2))
  await createEliteGameWinner('3', getDate(1))
  await createEliteGameWinner('4', getDate(0))

  const { general, commander, sergeant } = await promotionService.doPromotions()
  expect(general).toBe(null)
  expect(commander).toBe(null)
  expect(sergeant).toBe('4')
  expect(await promotionService.getCurrentRanks()).toEqual({ general: '1', commander: '2', sergeant: '4' })
})

test('getTopWinner - 9th time - no sergeant promotion', async () => {
  await init()

  await db?.runAsync('insert into elite_game_rank (rank, player, change_date) values (?,?,?)', [RANKS.GENERAL, '1', getDate(1)])
  await db?.runAsync('insert into elite_game_rank (rank, player, change_date) values (?,?,?)', [RANKS.COMMANDER, '2', getDate(1)])
  await db?.runAsync('insert into elite_game_rank (rank, player, change_date) values (?,?,?)', [RANKS.SERGEANT, '3', getDate(1)])
  await createEliteGameWinner('1', getDate(8))
  await createEliteGameWinner('1', getDate(7))
  await createEliteGameWinner('1', getDate(6))
  await createEliteGameWinner('2', getDate(5))
  await createEliteGameWinner('2', getDate(4))
  await createEliteGameWinner('1', getDate(3))
  await createEliteGameWinner('2', getDate(2))
  await createEliteGameWinner('3', getDate(1))
  await createEliteGameWinner('3', getDate(0))

  const { general, commander, sergeant } = await promotionService.doPromotions()
  expect(general).toBe(null)
  expect(commander).toBe(null)
  expect(sergeant).toBe(null)
  expect(await promotionService.getCurrentRanks()).toEqual({ general: '1', commander: '2', sergeant: '3' })
})

test('getTopWinner - 10th time - no sergeant promotion', async () => {
  await init()

  await db?.runAsync('insert into elite_game_rank (rank, player, change_date) values (?,?,?)', [RANKS.GENERAL, '1', getDate(1)])
  await db?.runAsync('insert into elite_game_rank (rank, player, change_date) values (?,?,?)', [RANKS.COMMANDER, '2', getDate(1)])
  await db?.runAsync('insert into elite_game_rank (rank, player, change_date) values (?,?,?)', [RANKS.SERGEANT, '3', getDate(1)])
  await createEliteGameWinner('1', getDate(9))
  await createEliteGameWinner('1', getDate(8))
  await createEliteGameWinner('1', getDate(7))
  await createEliteGameWinner('2', getDate(6))
  await createEliteGameWinner('2', getDate(5))
  await createEliteGameWinner('1', getDate(4))
  await createEliteGameWinner('2', getDate(3))
  await createEliteGameWinner('3', getDate(2))
  await createEliteGameWinner('3', getDate(1))
  await createEliteGameWinner('3', getDate(0))

  const { general, commander, sergeant } = await promotionService.doPromotions()
  expect(general).toBe(null)
  expect(commander).toBe(null)
  expect(sergeant).toBe(null)
  expect(await promotionService.getCurrentRanks()).toEqual({ general: '1', commander: '2', sergeant: '3' })
})

test('getTopWinner - 11th time - commander promotion', async () => {
  await init()

  await db?.runAsync('insert into elite_game_rank (rank, player, change_date) values (?,?,?)', [RANKS.GENERAL, '1', getDate(1)])
  await db?.runAsync('insert into elite_game_rank (rank, player, change_date) values (?,?,?)', [RANKS.COMMANDER, '2', getDate(1)])
  await db?.runAsync('insert into elite_game_rank (rank, player, change_date) values (?,?,?)', [RANKS.SERGEANT, '3', getDate(1)])
  await createEliteGameWinner('1', getDate(10))
  await createEliteGameWinner('1', getDate(9))
  await createEliteGameWinner('1', getDate(8))
  await createEliteGameWinner('2', getDate(7))
  await createEliteGameWinner('2', getDate(6))
  await createEliteGameWinner('1', getDate(5))
  await createEliteGameWinner('2', getDate(4))
  await createEliteGameWinner('3', getDate(3))
  await createEliteGameWinner('3', getDate(2))
  await createEliteGameWinner('3', getDate(1))
  await createEliteGameWinner('3', getDate(0))

  const { general, commander, sergeant } = await promotionService.doPromotions()
  expect(general).toBe(null)
  expect(commander).toBe('3')
  expect(sergeant).toBe(null)
  expect(await promotionService.getCurrentRanks()).toEqual({ general: '1', commander: '3', sergeant: null })
})

test('getTopWinner - 12th time - general promotion', async () => {
  await init()

  await db?.runAsync('insert into elite_game_rank (rank, player, change_date) values (?,?,?)', [RANKS.GENERAL, '1', getDate(1)])
  await db?.runAsync('insert into elite_game_rank (rank, player, change_date) values (?,?,?)', [RANKS.COMMANDER, '3', getDate(1)])
  await createEliteGameWinner('1', getDate(11))
  await createEliteGameWinner('1', getDate(10))
  await createEliteGameWinner('1', getDate(9))
  await createEliteGameWinner('2', getDate(8))
  await createEliteGameWinner('2', getDate(7))
  await createEliteGameWinner('1', getDate(6))
  await createEliteGameWinner('2', getDate(5))
  await createEliteGameWinner('3', getDate(4))
  await createEliteGameWinner('3', getDate(3))
  await createEliteGameWinner('3', getDate(2))
  await createEliteGameWinner('3', getDate(1))
  await createEliteGameWinner('3', getDate(0))

  const { general, commander, sergeant } = await promotionService.doPromotions()
  expect(general).toBe('3')
  expect(commander).toBe('1')
  expect(sergeant).toBe(null)
  expect(await promotionService.getCurrentRanks()).toEqual({ general: '3', commander: '1', sergeant: null })
})

test('getTopWinner - 12th time - sergeant promotion', async () => {
  await init()

  await db?.runAsync('insert into elite_game_rank (rank, player, change_date) values (?,?,?)', [RANKS.GENERAL, '1', getDate(1)])
  await db?.runAsync('insert into elite_game_rank (rank, player, change_date) values (?,?,?)', [RANKS.COMMANDER, '3', getDate(1)])
  await createEliteGameWinner('1', getDate(11))
  await createEliteGameWinner('1', getDate(10))
  await createEliteGameWinner('1', getDate(9))
  await createEliteGameWinner('2', getDate(8))
  await createEliteGameWinner('2', getDate(7))
  await createEliteGameWinner('1', getDate(6))
  await createEliteGameWinner('2', getDate(5))
  await createEliteGameWinner('3', getDate(4))
  await createEliteGameWinner('3', getDate(3))
  await createEliteGameWinner('3', getDate(2))
  await createEliteGameWinner('3', getDate(1))
  await createEliteGameWinner('2', getDate(0))

  const { general, commander, sergeant } = await promotionService.doPromotions()
  expect(general).toBe(null)
  expect(commander).toBe(null)
  expect(sergeant).toBe('2')
  expect(await promotionService.getCurrentRanks()).toEqual({ general: '1', commander: '3', sergeant: '2' })
})

test('getTopWinner - 3th time - general promotion', async () => {
  await init()

  await db?.runAsync('insert into elite_game_rank (rank, player, change_date) values (?,?,?)', [RANKS.GENERAL, '1', getDate(1)])
  await db?.runAsync('insert into elite_game_rank (rank, player, change_date) values (?,?,?)', [RANKS.COMMANDER, '2', getDate(1)])
  await db?.runAsync('insert into elite_game_rank (rank, player, change_date) values (?,?,?)', [RANKS.SERGEANT, '3', getDate(1)])
  await createEliteGameWinner('4', getDate(2))
  await createEliteGameWinner('4', getDate(1))
  await createEliteGameWinner('4', getDate(0))

  const { general, commander, sergeant } = await promotionService.doPromotions()
  expect(general).toBe('4')
  expect(commander).toBe(null)
  expect(sergeant).toBe(null)
  expect(await promotionService.getCurrentRanks()).toEqual({ general: '4', commander: '2', sergeant: '3' })
})

test('getTopWinner - migration siutation - win 1', async () => {
  await init()

  await createEliteGameWinner('1', getDate(4))
  await createEliteGameWinner('2', getDate(3))
  await createEliteGameWinner('1', getDate(2))
  await createEliteGameWinner('3', getDate(1))
  await createEliteGameWinner('1', getDate(0))

  const { general, commander, sergeant } = await promotionService.doPromotions()
  expect(general).toBe('1')
  expect(commander).toBe(null)
  expect(sergeant).toBe(null)
  expect(await promotionService.getCurrentRanks()).toEqual({ general: '1', commander: null, sergeant: null })
})

test('getTopWinner - migration siutation - win 2', async () => {
  await init()

  await createEliteGameWinner('1', getDate(4))
  await createEliteGameWinner('2', getDate(3))
  await createEliteGameWinner('1', getDate(2))
  await createEliteGameWinner('3', getDate(1))
  await createEliteGameWinner('2', getDate(0))

  const { general, commander, sergeant } = await promotionService.doPromotions()
  expect(general).toBe(null)
  expect(commander).toBe(null)
  expect(sergeant).toBe('2')
  expect(await promotionService.getCurrentRanks()).toEqual({ general: null, commander: null, sergeant: '2' })
})

test('getTopWinner - migration siutation - win 4', async () => {
  await init()

  await createEliteGameWinner('1', getDate(4))
  await createEliteGameWinner('2', getDate(3))
  await createEliteGameWinner('1', getDate(2))
  await createEliteGameWinner('3', getDate(1))
  await createEliteGameWinner('4', getDate(0))

  const { general, commander, sergeant } = await promotionService.doPromotions()
  expect(general).toBe(null)
  expect(commander).toBe('1')
  expect(sergeant).toBe('4')
  expect(await promotionService.getCurrentRanks()).toEqual({ general: null, commander: '1', sergeant: '4' })
})

test('getTopWinner - migration siutation - win 2-2', async () => {
  await init()

  await createEliteGameWinner('1', getDate(5))
  await createEliteGameWinner('2', getDate(4))
  await createEliteGameWinner('1', getDate(3))
  await createEliteGameWinner('3', getDate(2))
  await createEliteGameWinner('2', getDate(1))
  await createEliteGameWinner('2', getDate(0))

  const { general, commander, sergeant } = await promotionService.doPromotions()
  expect(general).toBe('2')
  expect(commander).toBe('1')
  expect(sergeant).toBe(null)
  expect(await promotionService.getCurrentRanks()).toEqual({ general: '2', commander: '1', sergeant: null })
})
