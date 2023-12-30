import axios, { AxiosResponse } from 'axios'
import { IGameData } from './persistentDataStorage'

const BACKEND_SERVER_ROOT = 'https://bj.oglimmer.de'

export interface IGetPlayerResponse {
  cash: number
}

export interface IPostPlayerResponse {
  playerId: number
}

export interface IPostDeckResponse {
  deckId: number
}

export interface IPostGameResponse {
  gameId: number
}

export interface IPostBetResponse {
  betId: number
  card1: string
  card2: string
  dealersCard: string
  yourTotal: number
  followActions: string[]
}

export interface IPostHit {
  yourTotal: number
  drawnCard: string
  followActions: string[]
}

export interface IPostDouble {
  yourTotal: number
  drawnCard: string
}

export interface IPostSplit {
  secondBetId: number
  firstBetCard1: string
  firstBetCard2: string
  firstBetTotal: number
  secondBetCard1: string
  secondBetCard2: string
  secondBetTotal: number
  followActions: string[]
  secondBetFollowAction: string[]
}

export interface IPostInsurance {
  followActions: string[]
}

export interface IGetBet {
  dealersSecondCard: string
  dealersAdditionalCard: string
  result: string
  payout: number
  dealerTotal: number
}

export interface IHighscoreElement {
  pos: number
  name: string
  money: number
}

export type IHighscore = IHighscoreElement[]

export const getBet = async (storeElement: IGameData): Promise<IGetBet> => {
  if (!storeElement.gameId) {
    throw Error('storeElement.gameId not set!')
  }
  if (!storeElement.betId) {
    throw Error('storeElement.betId not set!')
  }
  const { data: resultData } = await axios.get<any, AxiosResponse<IGetBet>>(
    `${BACKEND_SERVER_ROOT}/v2/game/${storeElement.gameId}/bet/${storeElement.betId}`
  )
  return resultData
}

export const getHighscore = async (): Promise<IHighscore> => {
  const { data } = await axios.get(`${BACKEND_SERVER_ROOT}/v2/highscore`)
  return data.highscores
}

export const postPlayer = async (name: string): Promise<IPostPlayerResponse> => {
  const { data } = await axios.post<any, AxiosResponse<IPostPlayerResponse>>(`${BACKEND_SERVER_ROOT}/v2/player`, {
    name
  })
  return data
}

export const getPlayer = async (playerId: number): Promise<IGetPlayerResponse> => {
  const { data } = await axios.get<any, AxiosResponse<IGetPlayerResponse>>(
    `${BACKEND_SERVER_ROOT}/v2/player/${playerId}`
  )
  return data
}

export const postDeck = async (): Promise<IPostDeckResponse> => {
  const { data } = await axios.post<any, AxiosResponse<IPostDeckResponse>>(`${BACKEND_SERVER_ROOT}/v2/deck`)
  return data
}

export const postGame = async (storeElement: IGameData): Promise<IPostGameResponse> => {
  if (!storeElement.deckId) {
    throw Error('storeElement.deckId not set!')
  }
  const { data: gameData } = await axios.post<any, AxiosResponse<IPostGameResponse>>(`${BACKEND_SERVER_ROOT}/v2/game`, {
    deckId: storeElement.deckId
  })
  return gameData
}

export const postBet = async (storeElement: IGameData, betValue: number): Promise<IPostBetResponse> => {
  if (!storeElement.gameId) {
    throw Error('storeElement.gameId not set!')
  }
  const { data: betData } = await axios.post<any, AxiosResponse<IPostBetResponse>>(
    `${BACKEND_SERVER_ROOT}/v2/game/${storeElement.gameId}/bet`,
    {
      playerId: storeElement.playerId,
      bet: betValue
    }
  )
  return betData
}

export const postHit = async (storeElement: IGameData): Promise<IPostHit> => {
  if (!storeElement.gameId) {
    throw Error('storeElement.gameId not set!')
  }
  if (!storeElement.betId) {
    throw Error('storeElement.betId not set!')
  }
  const { data } = await axios.post<any, AxiosResponse<IPostHit>>(
    `${BACKEND_SERVER_ROOT}/v2/game/${storeElement.gameId}/bet/${storeElement.betId}/hit`
  )
  return data
}

export const postStand = async (storeElement: IGameData): Promise<any> => {
  if (!storeElement.gameId) {
    throw Error('storeElement.gameId not set!')
  }
  if (!storeElement.betId) {
    throw Error('storeElement.betId not set!')
  }
  const { data } = await axios.post<any, AxiosResponse<any>>(
    `${BACKEND_SERVER_ROOT}/v2/game/${storeElement.gameId}/bet/${storeElement.betId}/stand`
  )
  return data
}

export const postDouble = async (storeElement: IGameData): Promise<IPostDouble> => {
  if (!storeElement.gameId) {
    throw Error('storeElement.gameId not set!')
  }
  if (!storeElement.betId) {
    throw Error('storeElement.betId not set!')
  }
  const { data } = await axios.post<any, AxiosResponse<IPostDouble>>(
    `${BACKEND_SERVER_ROOT}/v2/game/${storeElement.gameId}/bet/${storeElement.betId}/double`
  )
  return data
}

export const postSplit = async (storeElement: IGameData): Promise<IPostSplit> => {
  if (!storeElement.gameId) {
    throw Error('storeElement.gameId not set!')
  }
  if (!storeElement.betId) {
    throw Error('storeElement.betId not set!')
  }
  const { data: betData } = await axios.post<any, AxiosResponse<IPostSplit>>(
    `${BACKEND_SERVER_ROOT}/v2/game/${storeElement.gameId}/bet/${storeElement.betId}/split`
  )
  return betData
}

export const postInsurance = async (storeElement: IGameData, insuranceBuy: string): Promise<IPostInsurance> => {
  if (!storeElement.gameId) {
    throw Error('storeElement.gameId not set!')
  }
  if (!storeElement.betId) {
    throw Error('storeElement.betId not set!')
  }
  const { data } = await axios.post<any, AxiosResponse<IPostInsurance>>(
    `${BACKEND_SERVER_ROOT}/v2/game/${storeElement.gameId}/bet/${storeElement.betId}/insurance`,
    { insurance: insuranceBuy }
  )
  return data
}
