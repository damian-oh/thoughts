import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import SiteFooter from "./quartz/components/SiteFooter"
import { PageTypeDispatcher } from "./quartz/plugins/pageTypes/dispatcher"

const config = await loadQuartzConfig()
export default config
const footer = SiteFooter()
export const layout = await loadQuartzLayout({ defaults: { footer } })
for (const pageLayout of Object.values(layout.byPageType)) {
  pageLayout.footer = footer
}

// The config loader creates its dispatcher before these layout overrides are applied.
config.plugins.emitters = config.plugins.emitters.map((emitter) =>
  emitter.name === "PageTypeDispatcher" ? PageTypeDispatcher(layout) : emitter,
)
