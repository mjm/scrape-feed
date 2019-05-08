import { scrapeFeed } from "../src"
import nock from "nock"

beforeAll(() => nock.disableNetConnect())
afterAll(() => nock.enableNetConnect())

test("reads a feed with no items", async () => {
  const scope = nock("https://example.org")
    .get("/feed.atom")
    .reply(200, emptyFeed, { "content-type": "application/xml" })

  const feed = await scrapeFeed("https://example.org/feed.atom")
  expect(feed).toMatchObject({
    title: "Example Blog",
    homePageURL: "",
    entries: [],
  })

  scope.done()
})

test("reads a feed with some items", async () => {
  const scope = nock("https://example.org")
    .get("/feed.atom")
    .reply(200, feedWithItems, { "content-type": "application/atom+xml" })

  const feed = await scrapeFeed("https://example.org/feed.atom")
  expect(feed).toMatchObject({
    title: "Example Blog",
    homePageURL: "https://example.com/",
    entries: [
      {
        id: "https://example.com/123",
        title: "",
        url: "https://example.com/123",
        textContent: "This is some content.",
        htmlContent: "This is some content.",
        publishedAt: new Date("2018-07-20T19:14:38Z"),
        modifiedAt: new Date("2018-07-20T19:14:38Z"),
      },
      {
        id: "https://example.com/124",
        title: "My Fancy Post Title",
        url: "https://example.com/my-fancy-post-title",
        textContent: "",
        htmlContent: "<p>I have some thoughts <em>about things</em>!</p>",
        publishedAt: new Date("2018-07-20T19:14:38.000Z"),
        modifiedAt: new Date("2018-07-20T19:14:38.000Z"),
      },
    ],
  })

  scope.done()
})

test("reads caching headers", async () => {
  const scope = nock("https://example.org")
    .get("/feed.atom")
    .reply(200, feedWithItems, {
      "content-type": "application/xml",
      etag: '"asdf"',
      "last-modified": "2018-07-20T19:14:38",
    })

  const feed = await scrapeFeed("https://example.org/feed.atom")
  expect(feed.cachingHeaders).toEqual({
    etag: '"asdf"',
    lastModified: "2018-07-20T19:14:38",
  })

  scope.done()
})

const emptyFeed = `
<?xml version="1.0" encoding="UTF-8"?>
<feed
  xmlns="http://www.w3.org/2005/Atom"
  xml:lang="en-US"
  xml:base="https://mattmoriarity.com/wp-atom.php">
  <title type="text">Example Blog</title>
  <updated>2018-10-20T02:51:43Z</updated>
  <author>
    <name>John</name>
    <uri>https://john.example.com</uri>
  </author>
</feed>`

const feedWithItems = `
<?xml version="1.0" encoding="UTF-8"?>
<feed
  xmlns="http://www.w3.org/2005/Atom"
  xml:lang="en-US"
  xml:base="https://mattmoriarity.com/wp-atom.php">
  <title type="text">Example Blog</title>
  <updated>2018-10-20T02:51:43Z</updated>
  <link rel="alternate" type="text/html" href="https://example.com" />
  <id>https://example.com/feed.atom</id>
  <entry>
    <title type="html"><![CDATA[]]></title>
    <published>2018-07-20T19:14:38Z</published>
    <updated>2018-07-20T19:14:38Z</updated>
    <id>https://example.com/123</id>
    <content type="text"><![CDATA[This is some content.]]></content>
    <author>
      <name>John</name>
      <uri>https://john.example.com</uri>
    </author>
  </entry>
  <entry>
    <title type="text">My Fancy Post Title</title>
    <updated>2018-07-20T19:14:38Z</updated>
    <link rel="alternate" type="text/html" href="https://example.com/my-fancy-post-title" />
    <id>https://example.com/124</id>
    <content type="html"><![CDATA[<p>I have some thoughts <em>about things</em>!</p>]]></content>
    <author>
      <name>John</name>
      <uri>https://john.example.com</uri>
    </author>
  </entry>
</feed>>`
