interface Timers {
    [key: number]: Timer;
}

interface Counters {
    [key: number]: Timer;
}

class Timer {
    active!: boolean;
    counter!: number;
    minutes!: number;
    minutesStr!: string;
    seconds!: number;
    secondsStr!: string;
    submited!: boolean;
    intervalId: any;
    getTime = () => {
        return this.minutesStr + ':' + this.secondsStr;
    };

    public constructor(init?:Partial<Timer>) {
        Object.assign(this, init);
    }
}


export class TimersHelper {

    timers:Timers = {};
    counters:Counters = {};
    current_counter:any = {};
    current_timer:any = {};

    constructor() { }

    clearAllCounters(){
        this.counters = {};
    }

    clearAllTimers(){
        this.timers = {};
    }

    handleCounter(counter_idx:number, initial_value:number = 0, pause_others = true){
        if(pause_others){
            this.pauseAllCounters();
        }
        if(!this.counters.hasOwnProperty(counter_idx)) {
            this.counters[counter_idx] = this.createTimer('counter', initial_value);
        } else {
            this.counters[counter_idx].active = true;
        }
        this.current_counter = this.counters[counter_idx];
    }

    handleTimer(timer_idx:number, initial_value:number = 0, pause_others = true) {
        if(pause_others){
            this.pauseAllTimers();
        }
        if(!this.timers.hasOwnProperty(timer_idx)) {
            this.timers[timer_idx] = this.createTimer('timer', initial_value);
        } else {
            this.timers[timer_idx].active = true;
        }
        this.current_timer = this.timers[timer_idx];
    }

    createTimer(type:string = 'counter', initial_value:number = 0): Timer {
        const timer = new Timer();
        timer.active = true;

        timer.counter = initial_value;
        timer.minutes = Math.floor(initial_value / 60);
        timer.minutesStr = (timer.minutes.toString().length < 2 ? '0' + timer.minutes : timer.minutes).toString();
        timer.seconds = timer.counter % 60;
        timer.secondsStr = (timer.seconds.toString().length < 2 ? '0' + timer.seconds : timer.seconds).toString();
        timer.submited = false;
        timer.intervalId = setInterval(this.progressTimer, 1000,timer, type);
        timer.getTime = function(){
            return this.minutesStr + ':' + this.secondsStr;
        };
        return timer;

    }

    pauseAllCounters(){
        for(const key in this.counters){
            this.counters[key].active = false;
        }
    }

    pauseAllTimers(){
        for(const key in this.timers){
            this.timers[key].active = false;
        }
    }

    progressTimer(self:any, type:string = 'counter') {
        if (self.active && !self.submited){
            self.counter = type == 'counter' ? self.counter + 1 : self.counter - 1;
            self.minutes = Math.floor(self.counter / 60);
            self.minutesStr = self.minutes.toString().length < 2 ? '0' + self.minutes : self.minutes;
            self.seconds = self.counter % 60;
            self.secondsStr = self.seconds.toString().length < 2 ? '0' + self.seconds : self.seconds;
        }
    }
}
