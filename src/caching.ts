import { Response } from "node-fetch"
import { CachingHeaders } from "./"

export function getCachingHeaders(res: Response): CachingHeaders {
  const result: CachingHeaders = {}

  const etag = res.headers.get("etag")
  if (etag) {
    result.etag = etag
  }
  const lastModified = res.headers.get("last-modified")
  if (lastModified) {
    result.lastModified = lastModified
  }

  return result
}

export function toRequestHeaders(
  headers?: CachingHeaders
): { [key: string]: string } {
  const result: { [key: string]: string } = {}

  if (!headers) {
    return result
  }

  if (headers.etag) {
    result["if-none-match"] = headers.etag
  }
  if (headers.lastModified) {
    result["if-modified-since"] = headers.lastModified
  }

  return result
}
