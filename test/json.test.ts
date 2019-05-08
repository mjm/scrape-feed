import { scrapeFeed } from "../src"
import nock from "nock"

beforeAll(() => nock.disableNetConnect())
afterAll(() => nock.enableNetConnect())

test("reads a feed with no items", async () => {
  const scope = nock("https://example.org")
    .get("/feed.json")
    .reply(200, emptyFeed)

  const feed = await scrapeFeed("https://example.org/feed.json")
  expect(feed).toMatchObject({
    title: "My Empty Feed",
    homePageURL: "",
    entries: [],
  })

  scope.done()
})

test("reads a feed with some items", async () => {
  const scope = nock("https://example.org")
    .get("/feed.json")
    .reply(200, feedWithItems)

  const feed = await scrapeFeed("https://example.org/feed.json")
  expect(feed).toMatchObject({
    title: "Example Blog",
    homePageURL: "https://example.com/",
    entries: [
      {
        id: "123",
        title: "",
        url: "",
        textContent: "This is some content.",
        htmlContent: "",
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
    .get("/feed.json")
    .reply(200, feedWithItems, {
      etag: '"asdf"',
      "last-modified": "2018-07-20T19:14:38",
    })

  const feed = await scrapeFeed("https://example.org/feed.json")
  expect(feed.cachingHeaders).toEqual({
    etag: '"asdf"',
    lastModified: "2018-07-20T19:14:38",
  })

  scope.done()
})

const emptyFeed = {
  version: "https://jsonfeed.org/version/1",
  title: "My Empty Feed",
  items: [],
}

const feedWithItems = {
  version: "https://jsonfeed.org/version/1",
  title: "Example Blog",
  feed_url: "https://example.com/feed.json",
  home_page_url: "https://example.com",
  items: [
    {
      id: "123",
      content_text: "This is some content.",
      date_published: "2018-07-20T19:14:38+00:00",
      date_modified: "2018-07-20T19:14:38+00:00",
    },
    {
      id: 124,
      title: "My Fancy Post Title",
      content_html: "<p>I have some thoughts <em>about things</em>!</p>",
      url: "https://example.com/my-fancy-post-title",
    },
  ],
}
