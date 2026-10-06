import test from "node:test"
import assert from "node:assert/strict"
import { fetchCanonical } from "./util"

test("canonical metadata on content pages does not cause a second fetch", async (t) => {
  for (const ending of [">", "/>"]) {
    const response = new Response(
      `<link rel="canonical" href="https://example.com/music/"${ending}`,
      { headers: { "content-type": "text/html" } },
    )
    const fetch = t.mock.method(globalThis, "fetch", async () => response)
    assert.equal(await fetchCanonical(new URL("https://example.com/music/")), response)
    assert.equal(fetch.mock.callCount(), 1)
    fetch.mock.restore()
  }
})

test("alias redirects still fetch their canonical destination", async (t) => {
  const response = new Response(
    '<link rel="canonical" href="./music/"><meta http-equiv="refresh" content="0; url=./music/">',
    { headers: { "content-type": "text/html" } },
  )
  const destination = new Response("Collection")
  const fetch = t.mock.method(globalThis, "fetch", async (url: string) =>
    url.endsWith("/music/") ? destination : response,
  )
  assert.equal(await fetchCanonical(new URL("https://example.com/music")), destination)
  assert.equal(fetch.mock.callCount(), 2)
  assert.equal(fetch.mock.calls[1].arguments[0], "https://example.com/music/")
})

test("self-referencing redirects and non-HTML resources are not fetched twice", async (t) => {
  for (const response of [
    new Response(
      '<link rel="canonical" href="https://example.com/music/"><meta http-equiv="refresh" content="0; url=/music/">',
      { headers: { "content-type": "text/html" } },
    ),
    new Response("PDF", { headers: { "content-type": "application/pdf" } }),
  ]) {
    const fetch = t.mock.method(globalThis, "fetch", async () => response)
    assert.equal(await fetchCanonical(new URL("https://example.com/music/")), response)
    assert.equal(fetch.mock.callCount(), 1)
    fetch.mock.restore()
  }
})
