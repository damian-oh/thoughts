import type { QuartzComponent, QuartzComponentConstructor } from "./types"
import style from "./styles/siteFooter.scss"

export default (() => {
  const SiteFooter: QuartzComponent = ({ displayClass }) => (
    <footer class={`site-footer ${displayClass ?? ""}`}>
      <p class="site-footer-main">
        <span>© {new Date().getFullYear()} Damian Oh</span>
        <span>
          <span aria-hidden="true">· </span>
          <a href="/index.xml" type="application/rss+xml">
            RSS
          </a>
        </span>
      </p>
      <p class="site-footer-credit">
        Created with <a href="https://quartz.jzhao.xyz/">Quartz</a>
      </p>
    </footer>
  )

  SiteFooter.css = style
  return SiteFooter
}) satisfies QuartzComponentConstructor
