export function browserBlockProcessor(registry: any) {

    registry.blockMacro(function () {
        // @ts-ignore
        const self: any = this

        self.named('browser')
        self.process(function(parent: any, target: any, attrs: any) {
            const query = encodeURIComponent(target)

            const html = `<iframe class="browser" src="../browser/?cmd=edit&arg=${query}">${target}</iframe>`

            return self.createBlock(parent, 'pass', html)
        })
    })
}