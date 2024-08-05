/* eslint-disable */
import asciidoctor from "@asciidoctor/core";

class GraphAcademyTemplateConverter {
    // @ts-ignore
    private baseConverter: any = asciidoctor.Html5Converter.$new();
    private templates: Record<string, (node: any) => any> = {

    }

    convert (node: any, transform: any, opts: any) {
        const template = this.templates[transform || node.node_name]
        if (template) {
          return template(node)
        }

        return this.baseConverter.convert(node, transform, opts)
      }

}

// @ts-ignore
asciidoctor.ConverterFactory?.register(new GraphAcademyTemplateConverter(), ['html5'])