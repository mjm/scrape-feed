import { scrapeFeed } from "../src"
import nock from "nock"

beforeAll(() => nock.disableNetConnect())
afterAll(() => nock.enableNetConnect())

test("reads a feed with no items", async () => {
  const scope = nock("https://example.org")
    .get("/feed.xml")
    .reply(200, emptyFeed, { "content-type": "application/xml" })

  const feed = await scrapeFeed("https://example.org/feed.xml")
  expect(feed).toMatchObject({
    title: "My Empty Feed",
    homePageURL: "",
    entries: [],
  })

  scope.done()
})

test("reads a feed with some items", async () => {
  const scope = nock("https://example.org")
    .get("/feed.xml")
    .reply(200, feedWithItems, { "content-type": "application/rss+xml" })

  const feed = await scrapeFeed("https://example.org/feed.xml")
  expect(feed).toMatchObject({
    title: "Example Blog",
    homePageURL: "https://example.com/",
    entries: [
      {
        id: "123",
        title: "",
        url: "",
        textContent: "This is some content.",
        htmlContent: "This is some content.",
        publishedAt: new Date("2018-07-20T19:14:38Z"),
        modifiedAt: new Date("2018-07-20T19:14:38Z"),
      },
      {
        id: "124",
        title: "My Fancy Post Title",
        url: "https://example.com/my-fancy-post-title",
        textContent: "",
        htmlContent: "<p>I have some thoughts <em>about things</em>!</p>",
        publishedAt: null,
        modifiedAt: null,
      },
    ],
  })

  scope.done()
})

test("reads caching headers", async () => {
  const scope = nock("https://example.org")
    .get("/feed.xml")
    .reply(200, feedWithItems, {
      "content-type": "application/xml",
      etag: '"asdf"',
      "last-modified": "2018-07-20T19:14:38",
    })

  const feed = await scrapeFeed("https://example.org/feed.xml")
  expect(feed!.cachingHeaders).toEqual({
    etag: '"asdf"',
    lastModified: "2018-07-20T19:14:38",
  })

  scope.done()
})

const emptyFeed = `
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  >
  <channel>
    <title>My Empty Feed</title>
    <description></description>
  </channel>
</rss>`

const feedWithItems = `
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:atom="http://www.w3.org/2005/Atom"
  >
  <channel>
    <title>Example Blog</title>
    <atom:link href="https://example.com/feed.xml" rel="self" type="application/rss+xml" />
    <link>https://example.com</link>
    <description></description>
    <lastBuildDate>Sat, 13 Oct 2018 10:49:30 +0000</lastBuildDate>
    <language>en-US</language>
    <item>
      <title></title>
      <pubDate>Fri, 20 Jul 2018 19:14:38 +0000</pubDate>
      <guid isPermaLink="false">123</guid>
      <description><![CDATA[This is some content.]]></description>
    </item>
    <item>
      <title>My Fancy Post Title</title>
      <link>https://example.com/my-fancy-post-title</link>
      <guid isPermaLink="false">124</guid>
      <content:encoded><![CDATA[<p>I have some thoughts <em>about things</em>!</p>]]></content:encoded>
    </item>
  </channel>
</rss>`
