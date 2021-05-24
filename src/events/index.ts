import { EventEmitter } from 'events'
import { UserCompletedLesson } from '../domain/events/UserCompletedLesson'
import { UserCompletedModule } from '../domain/events/UserCompletedModule'
import { UserEnrolled } from '../domain/events/UserEnrolled'
import { DomainEvent } from './domain-event'



export interface Listener<T extends DomainEvent> {
    (event: T): void;
}

export interface Disposable {
    dispose: () => void;
}

class GraphAcademyEventEmitter {

    private emitter = new EventEmitter()

    on<T extends DomainEvent>(event: DomainEvent, listener: Listener<T>): void {
        this.emitter.on(event.constructor.name, listener)
    }

    off<T extends DomainEvent>(event: DomainEvent, listener: Listener<T>): void {
        this.emitter.off(event.constructor.name, listener)
    }

    emit(event: DomainEvent) {
        this.emitter.emit(event.constructor.name, event)
    }

}


export const emitter = new GraphAcademyEventEmitter()