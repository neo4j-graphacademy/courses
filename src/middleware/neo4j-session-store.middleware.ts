/* eslint-disable */
import { SessionData, Store } from "express-session"
import { Driver, Session, } from "neo4j-driver"

type GetCallbackFunction = (err: any, session?: SessionData | null) => void;

const noop: GetCallbackFunction = (): void => {}

export default class Neo4jStore extends Store {
    constructor(private readonly driver: Driver) {
        super()
    }

    /**
     * Gets the session from the store given a session ID and passes it to `callback`.
     *
     * The `session` argument should be a `Session` object if found, otherwise `null` or `undefined` if the session was not found and there was no error.
     * A special case is made when `error.code === 'ENOENT'` to act like `callback(null, null)`.
     */
    get(sid: string, callback: GetCallbackFunction = noop): void {
        const session: Session = this.driver.session()

        session.readTransaction(tx => tx.run(`MATCH (s:Session {id: $sid}) RETURN s`, { sid }))
            .then(res => {
                const data = res.records.length ? JSON.parse(res.records[0].get('s').properties.payload) as SessionData : null

                if (data) {
                    // @ts-ignore
                    data.cookie.expires = new Date(data.cookie.expires as string)
                }

                if (callback) callback(null, data)
            })
            .catch(e => {
                if (callback) callback(e)
            })
            .finally(() => session.close())
    }

    /** Upsert a session in the store given a session ID and `SessionData` */
    set(sid: string, data: SessionData, callback?: (err?: any) => void): void {
        const session: Session = this.driver.session()

        session.writeTransaction(tx => {
            return tx.run(`
                MERGE (s:Session {id: $sid})
                ON CREATE SET s.createdAt = datetime()
                SET s.updatedAt = datetime(), s.payload = $payload
            `, { sid, payload: JSON.stringify(data)})
        })
            .then(() => callback && callback(null))
            .catch(e => callback && callback(e))
            .finally(() => session.close())
    }

    /** Destroys the dession with the given session ID. */
    destroy(sid: string, callback?: (err?: any) => void): void {
        const session: Session = this.driver.session()

        session.writeTransaction(tx => tx.run(`MATCH (s:Session {id: $sid}) DETACH DELETE s`, { sid }))
            .then(() => callback && callback(null))
            .catch(e => callback && callback(e))
            .finally(() => session.close())

    }

    /** Returns all sessions in the store */
    // https://github.com/DefinitelyTyped/DefinitelyTyped/pull/38783, https://github.com/expressjs/session/pull/700#issuecomment-540855551
    all(callback: (err: any, obj?: SessionData[] | { [sid: string]: SessionData; } | null) => void): void {
        const session: Session = this.driver.session()

        session.readTransaction(tx => {
            tx.run(`MATCH (s:Session) RETURN s`)
                .then(res => {
                    const sessions = res.records.map(row => row.get('s')?.properties)

                    return tx.commit()
                        .then(() => session.close())
                        .then(() => callback(null, sessions))
                        .catch(e => callback(e))
                })
        })
    }

    /** Returns the amount of sessions in the store. */
    length(callback: (err: any, length: number) => void): void {
        const session: Session = this.driver.session()

        session.readTransaction(tx => tx.run(`MATCH (s:Session) RETURN count(*) AS count`))
            .then(res => {
                    const length = res.records[0]?.get('count').toNumber() || 0
                    callback(null, length)
                })
                .catch(e => callback(e, 0))
                .finally(() => session.close())
    }

    /** Delete all sessions from the store. */
    clear(callback?: (err?: any) => void): void {
        const session: Session = this.driver.session()

        session.writeTransaction(tx => tx.run(`MATCH (s:Session) DETACH DELETE s`))
            .then(() => callback && callback(null))
            .catch(e => callback && callback(e))
            .finally(() => session.close())
    }

    /** "Touches" a given session, resetting the idle timer. */
    touch?(sid: string, data: SessionData, callback?: () => void): void {
        const session: Session = this.driver.session()

        session.writeTransaction(tx => tx.run(`
                MERGE (s:Session {id: $sid})
                SET s.updatedAt = datetime(), s.payload = $payload
            `, { sid, payload: JSON.stringify(data)})
        )
            .then(() => callback && callback())
            .catch(() => callback && callback())
            .finally(() => session.close())
    }


}