import { WORKSPACE_URL } from "../../../constants"
import { isTruthy } from "../../../utils"

/* eslint-disable */
export function workspaceBlockProcessor(registry: any) {
    registry.blockMacro(function () {
        // @ts-ignore
        const self: any = this

        self.named('workspace')
        self.process(function (parent: any, text: any, attrs: any) {
            // Replace backticks
            text = text.replace(/`(.*)`/, '<code>$1</code>')

            const {
                connectUrl,
                guide,
                tab,
                acceptTerms,
            } = attrs

            const url = new URL(WORKSPACE_URL)

            if (tab) {
                url.pathname = `/workspace/${tab}`
            }

            if (connectUrl) {
                url.searchParams.set('connectURL', connectUrl)
            }

            if (guide) {
                url.searchParams.set('cmd', 'guide')
                url.searchParams.set('arg', guide)
            }

            if (isTruthy(acceptTerms)) {
                url.searchParams.set('acceptTerms', 'true')
            }


            const link = `<a class="btn btn-workspace" target="_blank" href="${url.toString()}">${text} &rarr;</a>`

            return self.createBlock(parent, 'pass', link)
        })
    })
}