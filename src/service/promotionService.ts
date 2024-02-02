import { EliteGameDataStorage, EliteGameRank } from './eliteGameDataStorage'
import LogManager from '../logger/logger'

export const RANKS = {
  GENERAL: 'General',
  COMMANDER: 'Commander',
  SERGEANT: 'Sergeant'
}

export function getTodayAsDate(date: Date = new Date()): string {
  const berlinDate = date.toLocaleDateString('de-DE', {
    timeZone: 'Europe/Berlin',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
  return berlinDate
}

class PromotionService {
  private readonly logger = LogManager.getInstance().logger('RankFinder')

  findRank (toSearch: string, ranks: EliteGameRank[]): string | null {
    return ranks.find(r => r.rank === toSearch)?.player ?? null
  }

  async getCurrentRanks(): Promise<{ general: string | null, commander: string | null, sergeant: string | null }> {
    const ranks = await EliteGameDataStorage.instance().loadRanks()

    const currentGeneral = this.findRank(RANKS.GENERAL, ranks)
    const currentCommander = this.findRank(RANKS.COMMANDER, ranks)
    const currentSergeant = this.findRank(RANKS.SERGEANT, ranks)

    return {
      general: currentGeneral,
      commander: currentCommander,
      sergeant: currentSergeant
    }
  }

  async getTopWinner(days: number, minWins: number, playerToExclude: string): Promise<string | null> {
    const winner = await EliteGameDataStorage.instance().loadWinners(days, minWins, playerToExclude)
    if (!winner || winner.length === 0) {
      return null
    }
    if (winner.length === 1) {
      return winner[0].player
    }
    if (winner[0].countRows === winner[1].countRows) {
      return null
    }
    return winner[0].player
  }

  async getLastWinner(): Promise<string | null> {
    return await EliteGameDataStorage.instance().loadLastWinner()
  }

  async getGeneralPromotion(): Promise<string | null> {
    const currentRanks = await this.getCurrentRanks()
    const topWinner = await this.getTopWinner(365, 3, "-1")
    if (topWinner && currentRanks.general !== topWinner) {
      this.logger.logSync('INFO', `Found new general: ${topWinner}, old was ${currentRanks.general}`)
      await EliteGameDataStorage.instance().writeGameRank(RANKS.GENERAL, topWinner)
      return topWinner
    }
    return null
  }

  async getCommanderPromotion(nextGeneral: string | null): Promise<string | null> {
    const currentRanks = await this.getCurrentRanks()
    const topWinner = await this.getTopWinner(14, 2, currentRanks.general ?? "-1")
    if (topWinner && currentRanks.commander !== topWinner && nextGeneral !== topWinner && currentRanks.general !== topWinner) {
      this.logger.logSync('INFO', `Found new commander: ${topWinner}, old was ${currentRanks.commander}`)
      await EliteGameDataStorage.instance().writeGameRank(RANKS.COMMANDER, topWinner)
      return topWinner
    }
    return null
  }

  async getSergeantPromotion(nextGeneral: string | null, nextCommander: string | null): Promise<string | null> {
    const currentRanks = await this.getCurrentRanks()
    const topWinner = await this.getLastWinner()
    if (topWinner && currentRanks.sergeant !== topWinner && nextGeneral !== topWinner && nextCommander !== topWinner && currentRanks.commander !== topWinner && currentRanks.general !== topWinner) {
      this.logger.logSync('INFO', `Found new sergeant: ${topWinner}, old was ${currentRanks.sergeant}`)
      await EliteGameDataStorage.instance().writeGameRank(RANKS.SERGEANT, topWinner)
      return topWinner
    }
    return null
  }

  async doPromotions(): Promise<{ general: string | null, commander: string | null, sergeant: string | null }> {
    const general = await this.getGeneralPromotion()
    const commander = await this.getCommanderPromotion(general)
    const sergeant = await this.getSergeantPromotion(general, commander)
    return {
      general,
      commander,
      sergeant
    }
  }
}

const singleton = new PromotionService()
export default singleton
