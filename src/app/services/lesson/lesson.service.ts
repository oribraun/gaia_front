import { Injectable } from '@angular/core';
import {Observable, Subject} from "rxjs";
import {EventsHashTable} from "../../interfaces/eventHashTable";

@Injectable({
    providedIn: 'root'
})
export class LessonService {

    private events: EventsHashTable<Subject<any>> = {};

    constructor() { }

    /**
     * Broadcast - emmit specific event changes
     * param {string} eventName
     * param {any} payload
     * return void;
     */
    public Broadcast(eventName: string, payload?: any): void {
        const event: Subject<any> = this.events[eventName];
        if (event !== null && typeof event !== 'undefined') {
            event.next(payload);
        }
    }

    /**
     * Start to Listen for a choosing event by adding to a list of interesting events
     * param {string} eventName
     * return {Observable} Observable;
     */
    public ListenFor(eventName: string): Observable<any> {
        let event: Subject<any> = this.events[eventName];
        if (event === null || typeof event === 'undefined') {
            event = new Subject<any>();
            this.events[eventName] = event;
        }
        return event.asObservable();
    }

    /**
     * Stop Listening for a choosing event
     * param {string} eventName
     * return {Observable} Observable;
     */
    public ClearEvent(eventName: string): void {
        delete this.events[eventName];
    }

    /**
     * Unsubscribe all events listening - memory perspective
     * return void;
     */
    public ClearAllEvents() {
        for (const name in this.events) {
            this.events[name].unsubscribe();
            delete this.events[name];
        }
    }
}
