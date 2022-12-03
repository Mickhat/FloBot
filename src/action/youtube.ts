/*
eslint-disable @typescript-eslint/strict-boolean-expressions
*/
import { AutocompleteInteraction, Client } from 'discord.js'
import { Database } from 'sqlite3'
import { ILogger } from '../logger/logger'
import { google } from 'googleapis'

const channelId: string | undefined = process.env.YT_CHANNEL_ID
const apiKey: string | undefined = process.env.YT_KEY

interface Video {
  name: string
  url: string
  description: string
}

const videos: Video[] = []

const yt = google.youtube('v3')

export async function loadCache (db: Database, log: ILogger): Promise<void> {
  const res = await getDataFromDb()

  for (const v of res) {
    if (!(v.url && v.video_title && v.description)) {
      log.logSync('ERROR', 'Missing data in some rows.')
      return
    }
    videos.push({ name: v.video_title, url: v.url, description: v.description })
  }

  if (!apiKey || !channelId) {
    log.logSync('ERROR', 'apiKey or channelId missing!')
    return
  }

  const cachedVideosCount = videos.length

  const channelData = await yt.channels.list({ part: ['id', 'statistics', 'contentDetails'], id: [channelId], key: apiKey })

  if (channelData.data.items == null) {
    log.logSync('ERROR', 'No Data from API')
    return
  }

  if (!channelData.data.items[0].statistics?.videoCount) {
    log.logSync('ERROR', 'API-Data not complete')
    return
  }

  if (cachedVideosCount === parseInt(channelData.data.items[0].statistics.videoCount)) {
    log.logSync('INFO', 'Cache is up-to-date with API')
    // eslint-disable-next-line no-useless-return
    return
  }

  async function getDataFromDb (): Promise<any[]> {
    return await new Promise<any>((resolve, reject) => {
      db.all('SELECT FROM videoCache VALUES (url, video_title, description)', (err, res) => {
        if (err) reject(err)
        resolve(res)
      })
    })
  }
}

export async function autocomplete (client: Client, interaction: AutocompleteInteraction, db: Database, log: ILogger): Promise<void> {

}
