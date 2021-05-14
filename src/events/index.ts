import { EventEmitter } from 'events'


export const EVENT_USER_ENROLLED = 'USER_ENROLLED'
export const EVENT_USER_COMPLETED_LESSON = 'USER_COMPLETED_LESSON'
export const EVENT_TEST = 'TEST'

export type Event = typeof EVENT_USER_ENROLLED | typeof EVENT_USER_COMPLETED_LESSON | typeof EVENT_TEST

export interface Listener<T> {
    (event: T): void;
}

export interface Disposable {
    dispose: () => void;
}

class GraphAcademyEventEmitter {

    private emitter = new EventEmitter()

    on<T>(event: Event, listener: Listener<T>): void {
        this.emitter.on(event, listener)
    }

    off<T>(event: Event, listener: Listener<T>): void {
        this.emitter.off(event, listener)
    }

    emit<T>(event: Event, payload: T) {
        this.emitter.emit(event, payload)
    }

}


export const emitter = new GraphAcademyEventEmitter()