/* eslint-disable */
export function inputBlockProcessor(registry: any) {
    registry.blockMacro(function () {
        // @ts-ignore
        const self: any = this

        self.named('input')
        self.process(function (parent: any, target: any, attrs: any) {
            const { type, ...other } = attrs

            const input = `<input type="${type || 'text'}" id="${target}" name="${target}" ${Object.entries(other)
                .map(([key, value]) => `${key}="${value}"`)
                .join(' ')}>`

            return self.createBlock(parent, 'pass', input)
        })
    })
}
