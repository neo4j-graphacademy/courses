import { EventEmitter } from 'events'
import { DomainEvent } from './domain-event'


export type Listener<T extends DomainEvent> = (event: T) => void;

export interface Disposable {
    dispose: () => void;
}

class GraphAcademyEventEmitter {

    private emitter = new EventEmitter()

    on<T extends DomainEvent>(event: DomainEvent, listener: Listener<T>): void {
        this.emitter.on(event.name, listener)
    }

    off<T extends DomainEvent>(event: DomainEvent, listener: Listener<T>): void {
        this.emitter.off(event.name, listener)
    }

    emit(event: DomainEvent) {
        this.emitter.emit(event.constructor.name, event)
    }

}

export const emitter = new GraphAcademyEventEmitter()