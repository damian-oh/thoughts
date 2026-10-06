import type { Root } from "hast"
import type { QuartzPluginData } from "../plugins/vfile"
import { FullSlug, joinSegments, pathToRoot, simplifySlug } from "./path"

/** The public page URL, using the same slug convention as the sitemap. */
export function canonicalPageUrl(baseUrl: string | undefined, slug: FullSlug): string | undefined {
  if (!baseUrl || slug === "404") return undefined
  return `https://${joinSegments(baseUrl, encodeURI(simplifySlug(slug)))}`
}

const origin = "quartz.invalid"

/** Build once per content snapshot, including generated pages. */
export function buildCanonicalLinkTargets(
  allFiles: readonly QuartzPluginData[],
): ReadonlyMap<string, FullSlug> {
  const targets = new Map<string, FullSlug>()
  const aliases = new Map<string, FullSlug | null>()
  const pages = allFiles.filter((page) => page.slug && page.slug !== "404")

  // Actual pages take precedence over aliases that collide with their URLs.
  for (const page of pages) {
    const slug = page.slug!
    const pageUrl = new URL(canonicalPageUrl(origin, slug)!)
    targets.set(pageUrl.pathname, slug)
    targets.set(new URL(encodeURI(slug), `https://${origin}/`).pathname, slug)
    targets.set(new URL(encodeURI(slug) + ".html", `https://${origin}/`).pathname, slug)
  }
  for (const page of pages) {
    const slug = page.slug!
    const aliasBase = `https://${origin}/${encodeURI(simplifySlug(slug)).replace(/\/$/, "")}`
    for (const alias of page.aliases ?? []) {
      const aliasUrl = new URL(
        encodeURI(alias),
        alias.startsWith(".") ? aliasBase : `https://${origin}/`,
      )
      for (const pathname of [aliasUrl.pathname, aliasUrl.pathname + ".html"]) {
        const previous = aliases.get(pathname)
        aliases.set(pathname, previous === undefined || previous === slug ? slug : null)
      }
    }
  }

  // Ambiguous aliases must follow the emitted redirect, whose destination can
  // also change during partial builds. Actual page URLs always take precedence.
  for (const [pathname, slug] of aliases) {
    if (slug !== null && !targets.has(pathname)) targets.set(pathname, slug)
  }
  return targets
}

/** Bypass known redirect aliases without changing the source notes. */
export function normalizeCanonicalLinks(
  root: Root,
  currentSlug: FullSlug,
  targets: ReadonlyMap<string, FullSlug>,
) {
  const currentUrl = canonicalPageUrl(origin, currentSlug)
  if (!currentUrl) return

  function walk(node: Root | Root["children"][number]) {
    if (node.type === "element" && node.tagName === "a") {
      const href = node.properties.href
      if (
        typeof href === "string" &&
        href &&
        !href.startsWith("#") &&
        !/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(href)
      ) {
        const destination = new URL(href, currentUrl)
        const target =
          destination.origin === `https://${origin}` ? targets.get(destination.pathname) : undefined
        if (target) {
          node.properties.href =
            joinSegments(pathToRoot(currentSlug), encodeURI(simplifySlug(target))) +
            destination.search +
            destination.hash
          node.properties["data-slug"] = target
        }
      }
    }
    if ("children" in node) node.children.forEach(walk)
  }
  walk(root)
}
