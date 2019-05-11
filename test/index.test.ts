import { scrapeFeed } from "../src"
import nock from "nock"

beforeAll(() => nock.disableNetConnect())
afterAll(() => nock.enableNetConnect())

test("throws error for unrecognized feed types", async () => {
  const scope = nock("https://example.org")
    .get("/feed.foo")
    .reply(200, "foo bar", { "content-type": "application/foo" })

  await expect(scrapeFeed("https://example.org/feed.foo")).rejects.toThrow()

  scope.done()
})

test("returns null if a 304 Not Modified response is returned", async () => {
  const scope = nock("https://example.org")
    .matchHeader("If-None-Match", '"asdf"')
    .matchHeader("If-Modified-Since", "2018-10-20T02:51:43Z")
    .get("/feed.json")
    .reply(304, "")

  const feed = await scrapeFeed("https://example.org/feed.json", {
    etag: '"asdf"',
    lastModified: "2018-10-20T02:51:43Z",
  })
  expect(feed).toBe(null)

  scope.done()
})

test("throws error if an error occurs in the request", async () => {
  const scope = nock("https://example.org")
    .get("/feed.json")
    .reply(500, "Internal Server Error")

  expect(scrapeFeed("https://example.org/feed.json")).rejects.toThrow(
    /unexpected response code/
  )

  scope.done()
})

test("returns all the items for a large feed", async () => {
  const scope = nock("https://overreacted.io")
    .get("/rss.xml")
    .replyWithFile(200, __dirname + "/overreacted.xml", {
      "content-type": "application/xml",
    })

  const { entries } = (await scrapeFeed("https://overreacted.io/rss.xml"))!
  expect(entries.length).toBe(21)

  scope.done()
})
