import fetch from "node-fetch"
import { is as typeis } from "type-is"
import { toRequestHeaders } from "./caching"
import { parseJsonFeed } from "./json"

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
): Promise<ScrapedFeed> {
  const headers = toRequestHeaders(cachingHeaders)
  const response = await fetch(url, { headers })
  const type = response.headers.get("content-type")

  if (!type) {
    throw new Error("No content-type header for feed, unsure how to parse it")
  }

  switch (typeis(type, ["json", "atom", "rss", "xml"])) {
    case "json":
      return await parseJsonFeed(response)
  }

  throw new Error(`No valid feed could be found at url ${url}`)
}
