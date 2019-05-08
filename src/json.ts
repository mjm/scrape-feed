import { Response } from "node-fetch"
import moment from "moment"
import { ScrapedFeed, ScrapedEntry } from "./"
import { getCachingHeaders } from "./caching"
import { normalizeURL } from "./url"

// This is based off the spec for JSON Feed.
// We're not validating this at runtime, but it makes it easier to write
// correct code for reading a valid feed.
type JSONFeed = JSONFeedV1

interface JSONFeedV1 {
  version: "https://jsonfeed.org/version/1"
  title: string
  home_page_url?: string
  feed_url?: string
  description?: string
  author?: JSONFeedAuthor
  items: JSONFeedItem[]
}

interface JSONFeedAuthor {
  name?: string
  url?: string
  avatar?: string
}

interface JSONFeedItem {
  id: string | number
  url?: string
  external_url?: string
  title?: string
  content_text?: string
  content_html?: string
  summary?: string
  image?: string
  banner_image?: string
  date_published?: string
  date_modified?: string
  author?: JSONFeedAuthor
  tags?: string[]
}

export async function parseJsonFeed(res: Response): Promise<ScrapedFeed> {
  const feedJson: JSONFeed = await res.json()

  return {
    title: feedJson.title,
    homePageURL: feedJson.home_page_url
      ? normalizeURL(feedJson.home_page_url)
      : "",
    cachingHeaders: getCachingHeaders(res),
    entries: feedJson.items.map(parseEntry),
  }
}

function parseEntry(entry: JSONFeedItem): ScrapedEntry {
  return {
    id: `${entry.id}`,
    url: entry.url || "",
    title: entry.title || "",
    textContent: entry.content_text || "",
    htmlContent: entry.content_html || "",
    publishedAt: readDate(entry.date_published),
    modifiedAt: readDate(entry.date_modified),
  }
}

function readDate(str: string | undefined): Date | null {
  if (!str) {
    return null
  }

  return moment(str).toDate()
}
