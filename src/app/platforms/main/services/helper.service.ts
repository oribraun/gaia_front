import { Injectable } from '@angular/core';
import {User} from "../../shared-slides/entities/user";
const { v4: uuidv4, v5: uuidv5 } = require('uuid');

declare var $: any;
@Injectable({
    providedIn: 'root'
})
export class HelperService {

    tooltipTimeout: any = null;
    private timers:any = {}
    private counters:any = {}
    current_counter:any = {}
    current_timer:any = {}
    constructor() { }

    applyTooltip() {
        $(() => {
            const e = $('[data-bs-toggle="tooltip"]');
            if (e && e.length) {
                e.tooltip({
                    trigger: 'hover'
                })
                e.on('click', () => {
                    clearInterval(this.tooltipTimeout)
                    this.tooltipTimeout = setTimeout(() => {
                        e.tooltip('hide')
                    }, 1000)
                })
            }
        })
    }

    create_uuidv5(str: string = '', hash: string = '') {
        // @ts-ignore
        let MY_NAMESPACE = '1b671a64-40d5-491e-99b0-da01ff1f3341';
        if (hash) {
            MY_NAMESPACE = hash
        }
        const u = uuidv5(str, MY_NAMESPACE);
        return u;
    };

    create_user_socket_uuidv5(str: string = '', hash: string = '') {
        // @ts-ignore
        let MY_NAMESPACE = '1b671a64-40d5-491e-99b0-da01ff1f3342';
        if (hash) {
            MY_NAMESPACE = hash
        }
        const u = uuidv5(str, MY_NAMESPACE);
        return u;
    };

    getUserReturnUrl(user: User) {
        let returnUrl = '';
        if (user.id && user.last_logged_platform) {
            returnUrl = '/' + user.last_logged_platform + '/dashboard'
        } else {
            returnUrl = '/onBoarding'
        }
        return returnUrl;
    }

    translateGoogle(message: string): Promise<string> {
        return new Promise((resolve, reject) => {
            var sourceLang = 'en';
            var targetLang = 'he';

            var url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl="+ sourceLang + "&tl=" + targetLang + "&dt=t&q=" + encodeURI(message);

            $.getJSON(url, (data: any) => {
                let translated_text = '';
                try {
                    translated_text = data[0].map((o: any) => o[0]).join('')
                    resolve(translated_text);
                } catch (e) {
                    reject(e)
                }
            });
        })
    }

    /**
     * Get the pointer position
     * param {any} e (event)
     * param {any} preventTouch
     * return {Object} { x: , y: }
     */
    getPointerPos(e: any, preventTouch: boolean) {
        let x = 0;
        let y = 0;
        if (e.clientX !== undefined && e.clientY !== undefined) {
            x = e.clientX;
            y = e.clientY;
        } else if (e.taretTouches) {
            if (preventTouch) {
                e.preventDefault();
            }
            x = e.taretTouches[0].clientX;
            y = e.taretTouches[0].clientY;
        } else if (e.touches) {
            if (preventTouch) {
                e.preventDefault();
            }
            x = e.touches[0].clientX;
            y = e.touches[0].clientY;
        }
        return {
            x: x,
            y: y
        };
    }

    clearAllCounters(){
        this.counters = {}
    }

    clearAllTimers(){
        this.timers = {}
    }

    handleCounter(counter_idx:number, initial_value:number=0){
        this.pauseAllCounters()
        if(!this.counters.hasOwnProperty(counter_idx)) {
            this.counters[counter_idx] = this.createTimer('counter', initial_value)
        } else {
            this.counters[counter_idx].active = true
        }
        this.current_counter = this.counters[counter_idx]
    }

    handleTimer(timer_idx:number, initial_value:number=0){
        this.pauseAllTimers()
        if(!this.timers.hasOwnProperty(timer_idx)) {
            this.timers[timer_idx] = this.createTimer('timer', initial_value)
        } else {
            this.timers[timer_idx].active = true
        }
        this.current_timer = this.timers[timer_idx]
    }

    createTimer(type:string='counter', initial_value:number=0){
        let Timer = Object()
        Timer.active = true
        Timer.counter = initial_value
        Timer.minutes = Math.floor(initial_value/60)
        Timer.minutesStr = Timer.minutes.toString().length < 2 ? '0' + Timer.minutes: Timer.minutes
        Timer.seconds = Timer.counter%60
        Timer.secondsStr = Timer.seconds.toString().length < 2 ? '0' + Timer.seconds: Timer.seconds
        Timer.submited = false
        Timer.intervalId = setInterval(this.progressTimer, 1000,Timer, type);
        return Timer

    }

    pauseAllCounters(){
        for(const key in this.counters){
            this.counters[key].active = false
        }
    }

    pauseAllTimers(){
        for(const key in this.timers){
            this.timers[key].active = false
        }
    }

    progressTimer(self:any, type:string='counter') {
        if (self.active && !self.submited){
            self.counter= type=='counter'? self.counter+1 : self.counter-1 
            self.minutes = Math.floor(self.counter/60)
            self.minutesStr = self.minutes.toString().length < 2 ? '0' + self.minutes: self.minutes
            self.seconds = self.counter%60
            self.secondsStr = self.seconds.toString().length < 2 ? '0' + self.seconds: self.seconds
        }
    }
}
