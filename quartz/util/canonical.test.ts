import test, { describe } from "node:test"
import assert from "node:assert/strict"
import type { Element, Root } from "hast"
import type { QuartzPluginData } from "../plugins/vfile"
import type { FullSlug } from "./path"
import { buildCanonicalLinkTargets, canonicalPageUrl, normalizeCanonicalLinks } from "./canonical"

describe("canonicalPageUrl", () => {
  test("matches sitemap URLs, including encoded paths and base directories", () => {
    for (const [slug, expected] of [
      ["index", "https://example.com/"],
      ["music/index", "https://example.com/music/"],
      ["music/essay", "https://example.com/music/essay"],
      ["nested/music/index", "https://example.com/nested/music/"],
      ["music/café", "https://example.com/music/caf%C3%A9"],
    ]) {
      assert.equal(canonicalPageUrl("example.com", slug as FullSlug), expected)
    }
    assert.equal(
      canonicalPageUrl("example.com/garden/", "index" as FullSlug),
      "https://example.com/garden/",
    )
    assert.equal(
      canonicalPageUrl("example.com/garden", "music/index" as FullSlug),
      "https://example.com/garden/music/",
    )
  })

  test("does not canonicalize 404 pages or invent a hostname", () => {
    assert.equal(canonicalPageUrl(undefined, "index" as FullSlug), undefined)
    assert.equal(canonicalPageUrl("example.com", "404" as FullSlug), undefined)
  })
})

describe("normalizeCanonicalLinks", () => {
  const pages = [
    { slug: "index", aliases: [] },
    { slug: "music/index", aliases: ["music"] },
    { slug: "music/essay", aliases: ["essay", "./old-essay"] },
    { slug: "music/café", aliases: ["café"] },
    { slug: "essay", aliases: [] },
  ] as unknown as QuartzPluginData[]

  function normalize(hrefs: string[], currentSlug = "index") {
    const anchors: Element[] = hrefs.map((href) => ({
      type: "element",
      tagName: "a",
      properties: { href },
      children: [{ type: "text", value: "Original label" }],
    }))
    const root: Root = { type: "root", children: anchors }
    normalizeCanonicalLinks(root, currentSlug as FullSlug, buildCanonicalLinkTargets(pages))
    assert.ok(
      anchors.every(
        (a) => a.children[0].type === "text" && a.children[0].value === "Original label",
      ),
    )
    return anchors.map((a) => a.properties.href)
  }

  test("bypasses collection aliases and index variants", () => {
    assert.deepEqual(
      normalize(["./music", "./music/index", "./music/index.html", "./index.html"]),
      ["./music/", "./music/", "./music/", "./"],
    )
  })

  test("handles nested aliases and preserves queries and fragments", () => {
    assert.deepEqual(
      normalize(["./old-essay?view=plain#section", "../music", "../café"], "music/index"),
      ["../music/essay?view=plain#section", "../music/", "../music/caf%C3%A9"],
    )
  })

  test("actual pages take precedence over colliding aliases", () => {
    assert.deepEqual(normalize(["./essay", "./essay.html"]), ["./essay", "./essay"])
  })

  test("leaves external links, attachments, unknown pages and local anchors alone", () => {
    const hrefs = [
      "https://other.com/essay",
      " https://other.com/music/essay",
      "//other.com/essay",
      "mailto:person@example.com",
      "./file.pdf#page=2",
      "./missing",
      "#section",
      "",
    ]
    assert.deepEqual(normalize(hrefs), hrefs)
  })
})

describe("buildCanonicalLinkTargets", () => {
  function page(slug: string, aliases: string[] = []): QuartzPluginData {
    return { slug, aliases } as QuartzPluginData
  }

  test("ambiguous aliases preserve links and metadata in either content order", () => {
    const pages = [page("first", ["shared"]), page("second", ["shared"])]
    for (const inventory of [pages, [...pages].reverse()]) {
      const targets = buildCanonicalLinkTargets(inventory)
      const root: Root = {
        type: "root",
        children: ["./shared?view=plain#section", "./shared.html"].map((href) => ({
          type: "element",
          tagName: "a",
          properties: { href, "data-slug": "shared" },
          children: [],
        })),
      }
      const before = structuredClone(root)
      normalizeCanonicalLinks(root, "index" as FullSlug, targets)
      assert.deepEqual(root, before)
    }
  })

  test("actual pages override ambiguous aliases in either content order", () => {
    const pages = [page("first", ["shared"]), page("shared"), page("last", ["shared"])]
    for (const inventory of [pages, [...pages].reverse()]) {
      const targets = buildCanonicalLinkTargets(inventory)
      assert.equal(targets.get("/shared"), "shared")
      assert.equal(targets.get("/shared.html"), "shared")
    }
  })

  test("repeated aliases with one destination remain usable", () => {
    const targets = buildCanonicalLinkTargets([page("first", ["shared", "shared"])])
    assert.equal(targets.get("/shared"), "first")
    assert.equal(targets.get("/shared.html"), "first")
  })

  test("new snapshots reflect additions, removals, renames and alias edits", () => {
    const pages = [page("first", ["old"]), page("removed", ["gone"])]
    const before = buildCanonicalLinkTargets(pages)
    pages[0].slug = "renamed" as FullSlug
    pages[0].aliases = ["new" as FullSlug]
    pages.splice(1, 1, page("added", ["fresh"]))
    const after = buildCanonicalLinkTargets(pages)
    for (const path of ["/first", "/old", "/removed", "/gone"]) {
      assert.ok(before.has(path))
      assert.equal(after.has(path), false)
    }
    assert.equal(after.get("/new"), "renamed")
    assert.equal(after.get("/renamed"), "renamed")
    assert.equal(after.get("/fresh"), "added")
    assert.equal(after.get("/added"), "added")
  })

  test("reusing targets across renders does not reread the inventory", () => {
    let reads = 0
    const pages = Array.from({ length: 1000 }, (_, i) => ({
      get slug() {
        reads++
        return `page-${i}` as FullSlug
      },
      get aliases() {
        reads++
        return [`alias-${i}` as FullSlug]
      },
    })) as QuartzPluginData[]
    const targets = buildCanonicalLinkTargets(pages)
    const initialReads = reads
    for (let i = 0; i < 1000; i++) {
      const anchor: Element = {
        type: "element",
        tagName: "a",
        properties: { href: `./alias-${i}` },
        children: [],
      }
      normalizeCanonicalLinks({ type: "root", children: [anchor] }, "index" as FullSlug, targets)
      assert.equal(anchor.properties.href, `./page-${i}`)
    }
    assert.equal(reads, initialReads)
  })
})
