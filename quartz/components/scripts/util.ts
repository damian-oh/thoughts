export function registerEscapeHandler(outsideContainer: HTMLElement | null, cb: () => void) {
  if (!outsideContainer) return
  function click(this: HTMLElement, e: HTMLElementEventMap["click"]) {
    if (e.target !== this) return
    e.preventDefault()
    e.stopPropagation()
    cb()
  }

  function esc(e: HTMLElementEventMap["keydown"]) {
    if (!e.key.startsWith("Esc")) return
    e.preventDefault()
    cb()
  }

  outsideContainer?.addEventListener("click", click)
  window.addCleanup(() => outsideContainer?.removeEventListener("click", click))
  document.addEventListener("keydown", esc)
  window.addCleanup(() => document.removeEventListener("keydown", esc))
}

export function removeAllChildren(node: HTMLElement) {
  while (node.firstChild) {
    node.removeChild(node.firstChild)
  }
}

// Only redirect stubs use canonical tags as navigation instructions. Ordinary
// pages also have canonical metadata and must not trigger a second fetch.
const canonicalRegex = /<link rel="canonical" href="([^"]*)"\s*\/?>/i
const refreshRegex = /<meta\b(?=[^>]*\bhttp-equiv="refresh")[^>]*>/i

export async function fetchCanonical(url: URL): Promise<Response> {
  const res = await fetch(`${url}`)
  if (!res.headers.get("content-type")?.startsWith("text/html")) {
    return res
  }

  // reading the body can only be done once, so we need to clone the response
  // to allow the caller to read it if it's was not a redirect
  const text = await res.clone().text()
  const redirect = refreshRegex.test(text) ? text.match(canonicalRegex)?.[1] : undefined
  const destination = redirect ? new URL(redirect, url) : undefined
  return destination && destination.href !== url.href ? fetch(`${destination}`) : res
}
