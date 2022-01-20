import hljs from 'highlight.js/lib/core'

import bash from 'highlight.js/lib/languages/bash'
import c from 'highlight.js/lib/languages/c-like'
import java from 'highlight.js/lib/languages/java'
import javascript from 'highlight.js/lib/languages/javascript'
import python from 'highlight.js/lib/languages/python'
import properties from 'highlight.js/lib/languages/properties'
import shell from 'highlight.js/lib/languages/shell'
import sql from 'highlight.js/lib/languages/sql'
import sql_more from 'highlight.js/lib/languages/sql_more'
import yaml from 'highlight.js/lib/languages/yaml'
import { definer as graphql } from 'highlightjs-graphql/graphql'
import cypher from 'highlightjs-cypher/src/cypher'




export default function highlight() {
  hljs.registerLanguage('sh', bash)
  hljs.registerLanguage('bash', bash)
  hljs.registerLanguage('shell', shell)
  hljs.registerLanguage('cypher', cypher)
  hljs.registerLanguage('cypher-shell', function () {
    return {
      contains: [
        {
          className: 'meta',
          begin: '^\\s{0,3}[neo4j]',
          end: '>',
          starts: {
            end: /[\n|;]/, subLanguage: 'cypher',
          },
        },
      ],
    }
  })
  // add an alias, use properties syntax highlighter on conf
  hljs.registerLanguage('conf', properties)
  hljs.registerLanguage('graphql', graphql)
  hljs.registerLanguage('c', c)
  hljs.registerLanguage('java', java)
  hljs.registerLanguage('js', javascript)
  hljs.registerLanguage('javascript', javascript)
  hljs.registerLanguage('sql', sql)
  hljs.registerLanguage('sql_more', sql_more)
  hljs.registerLanguage('yaml', yaml)
  hljs.registerLanguage('python', python)

  hljs.highlightAll()
}