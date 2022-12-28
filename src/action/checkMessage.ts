import { Client, Message } from "discord.js"
// import { TLDs } from "./checkMessageUtils"

export async function urlFilter (client: Client, message: Message): Promise<void> {
  let { content } = message
  if (!content) return
  content = content.replace(/\[punkt\]|∙|•/g, '.')
  const urlRegEx = /((http|HTTP)(s|S)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g

  const results = content.matchAll(urlRegEx)

  if (!results) return

  for (const url of results) {
    let extractedUrl = url[0]
    // get rid of protocol if included
    if (extractedUrl.startsWith('https://') || extractedUrl.startsWith('http://')) {
      extractedUrl = extractedUrl.split('://')[1]
    }

    // git rid of url-part after /
    if (extractedUrl.includes('/')) {
      extractedUrl = extractedUrl.split('/')[0]
    }

    // get rid of port
    if (extractedUrl.includes(':')) {
      extractedUrl = extractedUrl.split(':')[0]
    }

    // extract tld and sld
    const domainParts = extractedUrl.split('.')
    const tld = domainParts[domainParts.length - 1]
    const sld = domainParts[domainParts.length - 2]

    console.log(sld, tld)
  }
}
