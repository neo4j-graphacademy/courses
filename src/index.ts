import 'dotenv/config'
import app from './app'

// console.clear()
app.listen(3000, () => console.log('--\n🚀 Listening on http://localhost:3000\n\n'))


// import { emitter, EVENT_TEST } from './events'

// interface TestPayload {
//     foo: string;
//     bar: number
// }

// emitter.on<TestPayload>(EVENT_TEST, (payload) => console.log(Date.now(), payload.foo))

// emitter.emit(EVENT_TEST, { foo: 'string', bar: 2 })