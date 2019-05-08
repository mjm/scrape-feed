# scrape-feed

Reads the contents of JSON, RSS, and Atom feeds from a URL.

## Installation

```
npm install scrape-feed
```

## Usage

```javascript
const { scrapeFeed } = require("scrape-feed")

const feed = await scrapeFeed("https://www.mattmoriarity.com/feed.json")
```

`feed` will have information pulled from the feed. See `ScrapedFeed` in `src/index.ts` for the structure of `feed` here.

`scrape-feed` supports JSON Feed as well as Atom and RSS through [feedparser](https://www.npmjs.com/package/feedparser). All feed types produce the same structure, so it's a bit lossy in that way: not all feed information is captured.
