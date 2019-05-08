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
    .get("/feed.json")
    .reply(304, "")

  const feed = await scrapeFeed("https://example.org/feed.json", {
    etag: '"asdf"',
  })
  expect(feed).toBe(null)

  scope.done()
})
