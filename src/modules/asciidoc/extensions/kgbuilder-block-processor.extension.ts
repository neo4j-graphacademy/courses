/* eslint-disable */
export function kgBuilderBlockProcessor(registry: any) {
  registry.blockMacro(function () {
    // @ts-ignore
    const self: any = this

    self.named('kgbuilder')
    self.process(function (parent: any, text: any, attrs: any) {
      // Replace backticks
      text = text.replace(/`(.*)`/, '<code>$1</code>')

      const link = `<a class="btn btn-lab" id="lab" target="_blank" href="./kgbuilder/" ${Object.entries(attrs).map(([key, value]) => `${key}="${value}"`).join(' ')}>${text} &rarr;</a>`

      return self.createBlock(parent, 'pass', link)
    })
  })
}