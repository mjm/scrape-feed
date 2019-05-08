import URI from "urijs"

export function normalizeURL(url: string): string {
  return URI(url)
    .normalize()
    .toString()
}
