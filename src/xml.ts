import { Response } from "node-fetch"
import { ScrapedFeed, ScrapedEntry } from "./"
import { getCachingHeaders } from "./caching"
import FeedParser from "feedparser"

export async function parseXmlFeed(res: Response): Promise<ScrapedFeed> {
  const parser = new FeedParser({})
  const feed: ScrapedFeed = {
    title: "",
    homePageURL: "",
    cachingHeaders: getCachingHeaders(res),
    entries: [],
  }

  return new Promise<ScrapedFeed>((resolve, reject) => {
    parser.on("meta", function(this: FeedParser) {
      feed.title = this.meta.title || ""
      feed.homePageURL = this.meta.link || ""
    })

    parser.on("readable", function(this: FeedParser) {
      let item: FeedParser.Item

      while ((item = this.read())) {
        feed.entries.push(parseEntry(item))
      }
    })

    parser.on("error", function(err: any) {
      reject(err)
    })

    parser.on("end", function() {
      resolve(feed)
    })

    res.body.pipe(parser)
  })
}

function parseEntry(item: FeedParser.Item): ScrapedEntry {
  const itemAny = item as any
  const plainContent =
    itemAny["atom:content"] && itemAny["atom:content"]["@"].type === "text"
      ? itemAny["atom:content"]["#"]
      : null
  return {
    id: item.guid || item.link || "",
    url: item.link || "",
    title: item.title || "",
    htmlContent: item.description || "",
    textContent: plainContent || item.summary || "",
    publishedAt: item.pubdate,
    modifiedAt: item.date,
  }
}
