export function browserBlockProcessor(registry: any) {

    registry.blockMacro(function () {
        // @ts-ignore
        var self: any = this

        self.named('browser')
        self.process(function(parent: any, target: any, attrs: any) {
            const { type, ...other } = attrs

            const query = encodeURIComponent(target)


            const html = `<iframe class="browser" src="../browser/?cmd=edit&arg=${target}">${target}</iframe>`

            return self.createBlock(parent, 'pass', html)
        })
    })
}