import fetch from "node-fetch"
import { is as typeis } from "type-is"
import { toRequestHeaders } from "./caching"
import { parseJsonFeed } from "./json"
import { parseXmlFeed } from "./xml"

export interface ScrapedFeed {
  title: string
  homePageURL: string
  cachingHeaders: CachingHeaders
  entries: ScrapedEntry[]
}

export interface CachingHeaders {
  etag?: string
  lastModified?: string
}

export interface ScrapedEntry {
  id: string
  title: string
  url: string
  textContent: string
  htmlContent: string
  publishedAt: Date | null
  modifiedAt: Date | null
}

export async function scrapeFeed(
  url: string,
  cachingHeaders: CachingHeaders = {}
): Promise<ScrapedFeed | null> {
  const headers = toRequestHeaders(cachingHeaders)
  const response = await fetch(url, { headers })

  if (response.status === 304) {
    return null
  }

  const type = response.headers.get("content-type")

  if (!type) {
    throw new Error("No content-type header for feed, unsure how to parse it")
  }

  switch (typeis(type, ["json", "atom", "rss", "xml"])) {
    case "json":
      return await parseJsonFeed(response)
    case "atom":
    case "rss":
    case "xml":
      return await parseXmlFeed(response)
  }

  throw new Error(`No valid feed could be found at url ${url}`)
}
