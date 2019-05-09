# scrape-feed

[![npm version](https://img.shields.io/npm/v/scrape-feed.svg)](https://npm.im/scrape-feed)
[![CircleCI](https://img.shields.io/circleci/project/github/mjm/scrape-feed/master.svg)](https://circleci.com/gh/mjm/scrape-feed)
![ISC License](https://img.shields.io/npm/l/scrape-feed.svg)

Reads the contents of JSON, RSS, and Atom feeds from a URL.

## Installation

```
npm install scrape-feed
```

## Usage

### Simple use

```javascript
const { scrapeFeed } = require("scrape-feed")

const feed = await scrapeFeed("https://www.mattmoriarity.com/feed.json")
```

`feed` will have information pulled from the feed. See `ScrapedFeed` in `src/index.ts` for the structure of `feed` here.

`scrape-feed` supports JSON Feed as well as Atom and RSS through [feedparser](https://www.npmjs.com/package/feedparser). All feed types produce the same structure, so it's a bit lossy in that way: not all feed information is captured.

### Using caching headers

If you are polling feeds regularly and would like to avoid extra work, you can hang on to `feed.cachingHeaders` and provide it again when you next poll the feed. The caching headers include the `Etag` and `Last-Modified` response headers if the response included them. If they are provided when scraping, they will be used to set the `If-None-Match` and `If-Modified-Since` request headers, respectively.

A well-behaved server, when given these headers, will return a 304 Not Modified response with no body as long as the content hasn't changed, in which case `scrapeFeed` will just return null. If you get a null, you can go along your merry way and be happy you didn't waste that bandwidth and those CPU cycles.

```javascript
const { cachingHeaders } = feed
const feedAgain = await scrapeFeed(
  "https://www.mattmoriarity.com/feed.json",
  cachingHeaders
)
// => null
```
