import {EventEmitter, Injectable} from '@angular/core';
import {ApiService} from "../api.service";
import {environment} from "../../../environments/environment";
import {Config} from "../../config";
import {Observable, Subject} from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class WebSocketService {
    private socket!: WebSocket;
    private serverBase = environment.serverUrl;
    private socketUrl = '';
    protected socket_path = "ws/main_socket"
    private events: EventsHashTable<Subject<any>> = {};

    public onConnect: EventEmitter<any> = new EventEmitter<any>();
    public onMessage: EventEmitter<any> = new EventEmitter<any>();
    public onError: EventEmitter<any> = new EventEmitter<any>();
    public onDisconnect: EventEmitter<any> = new EventEmitter<any>();

    constructor(
        private apiService: ApiService,
        private config: Config
    ) {
        this.config.server_host_subject.subscribe((host) => {
            this.serverBase = this.config.server_host;
            this.setUpSocket();
        })
        if (this.config.server_host) {
            this.serverBase = this.config.server_host;
        }
        this.setUpSocket();
    }

    setUpSocket() {
        this.serverBase = this.serverBase.replace('http://', '')
        this.socketUrl = "ws://" + this.serverBase + this.socket_path;
    }

    connect(room_name: string) {
        const socketUrl = this.socketUrl + '/' +  room_name;
        this.socket = new WebSocket(socketUrl);

        this.socket.onopen = () => {
            const message = socketUrl + ' WebSocket connection established.'
            this.onConnect.emit(message)
        };

        this.socket.onmessage = (event) => {
            const o = JSON.parse(event.data)
            const message = o.message
            const data = o.data
            if (this.events[message]) {
                this.Broadcast(message, data)
            }
            // Handle received data
        };

        this.socket.onclose = () => {
            const message = socketUrl + ' WebSocket connection closed.'
            this.onDisconnect.emit(message)
        };

        this.socket.onerror = (err) => {
            const message = socketUrl + err
            this.onError.emit(message)
        }
    }

    disconnect() {
        this.socket.close();
    }

    sendMessage(message: string, data: object = {}) {
        if (this.socket.readyState === WebSocket.OPEN) {
            const json = {message: message, data: data}
            this.socket.send(JSON.stringify(json));
        }
    }

    /**
     * Broadcast - emmit specific event changes
     * param {string} eventName
     * param {any} payload
     * return void;
     */
    private Broadcast(eventName: string, payload?: any): void {
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

interface EventsHashTable<T> {
    [key: string]: T;
}
