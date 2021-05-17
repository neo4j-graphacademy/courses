// Not used
export function questionBlockExtension(registry: any) {
    registry.block(function() {
        // @ts-ignore
        const self = this;

        self.named('question')
        // self.onContext('sect2')
        self.process((parent: any, reader: any) => {
            var lines = reader.getLines().map(function (l:string) { return l.toUpperCase() })

            return self.createBlock(parent, 'paragraph', lines)
        })
    })

    registry.block(function () {
        // @ts-ignore
        var self = this
        self.named('shout')
        self.onContext('paragraph')
        self.process(function (parent: any, reader: any) {
          var lines = reader.getLines().map(function (l:string) { return l.toUpperCase() })
          return self.createBlock(parent, 'paragraph', lines)
        })
      })

}