import { send } from '../modules/mailer/mailer'

function main() {
    const val = send('adam@neo4j.com, martin.ohanlon@neo4j.com', 'Hello', 'This is a test')

    console.log(val)
}

main()
