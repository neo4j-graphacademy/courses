/* eslint-disable */
export function labBlockProcessor(registry: any) {
    registry.blockMacro(function () {
        // @ts-ignore
        const self: any = this

        self.named('lab')
        self.process(function (parent: any, text: any, attrs: any) {
            // Replace backticks
            text = text.replace(/`(.*)`/, '<code>$1</code>')

            const link = `<a class="btn btn-lab" id="lab" target="_blank" href="./lab/" ${Object.entries(attrs).map(([key, value]) => `${key}="${value}"`).join(' ')}>${text} &rarr;</a>`

            return self.createBlock(parent, 'pass', link)
        })
    })
}