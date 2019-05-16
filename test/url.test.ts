import { normalizeURL } from "../src"

test("normalizes a URL", () => {
  expect(normalizeURL("http://example.com")).toBe("http://example.com/")
})
