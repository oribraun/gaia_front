interface Timers {
    [key: number]: Timer;
}

interface Counters {
    [key: number]: Timer;
}

class Timer {
    total_sec!: number;
    active!: boolean;
    counter_sec!: number;
    minutes!: number;
    minutesStr!: string;
    seconds!: number;
    secondsStr!: string;
    submited!: boolean;
    type!: string;
    intervalId: any;
    getTime = () => {
        return this.minutesStr + ':' + this.secondsStr;
    };
    getCounter = () => {
        const current_sec = this.total_sec - this.counter_sec;
        const {minutesStr, secondsStr} = TimersHelper.calcTime(current_sec);
        return minutesStr + ':' + secondsStr;
    };

    public constructor(init?:Partial<Timer>) {
        Object.assign(this, init);
    }
}


export class TimersHelper {

    timers:Timers = {};
    counters:Counters = {};
    current_counter!: Timer;
    current_timer!: Timer;

    clearAllCounters() {
        this.counters = {};
    }

    clearAllTimers() {
        this.timers = {};
    }

    // handleCounter(counter_idx:number, initial_value:number = 0, pause_others = true) {
    //     if(pause_others) {
    //         this.pauseAllCounters();
    //     }
    //     if(!this.counters.hasOwnProperty(counter_idx)) {
    //         this.counters[counter_idx] = this.createTimer('counter', initial_value);
    //     } else {
    //         this.counters[counter_idx].active = true;
    //     }
    //     this.current_counter = this.counters[counter_idx];
    // }

    handleTimer(timer_idx:number, start_time_sec:number = 0, total_test_time_sec: number = 0, pause_others = true) {
        if(pause_others) {
            this.pauseAllTimers();
        }
        if(!this.timers.hasOwnProperty(timer_idx)) {
            this.timers[timer_idx] = this.createTimer('timer', start_time_sec, total_test_time_sec);
        } else {
            this.timers[timer_idx].active = true;
        }
        this.current_timer = this.timers[timer_idx];
    }

    createTimer(type:string = 'counter', start_time_sec:number = 0, total_test_time_sec:number = 0): Timer {
        const timer = new Timer();
        timer.active = true;

        timer.total_sec = total_test_time_sec;
        timer.counter_sec = start_time_sec;
        const {minutes, minutesStr, seconds, secondsStr} = TimersHelper.calcTime(timer.counter_sec);
        timer.minutes = minutes;
        timer.minutesStr = minutesStr;
        timer.seconds = seconds;
        timer.secondsStr = secondsStr;
        timer.submited = false;
        timer.intervalId = setInterval(this.progressTimer, 1000, timer, type);
        timer.type = type;
        return timer;

    }

    static calcTime(current_sec: number) {
        const minutes = Math.floor(current_sec / 60);
        const minutesStr = (minutes.toString().length < 2 ? '0' + minutes : minutes).toString();
        const seconds = current_sec % 60;
        const secondsStr = (seconds.toString().length < 2 ? '0' + seconds : seconds).toString();
        return {minutes, minutesStr, seconds, secondsStr};
    }

    pauseAllCounters() {
        for(const key in this.counters) {
            this.counters[key].active = false;
        }
    }

    pauseAllTimers() {
        for(const key in this.timers) {
            this.timers[key].active = false;
        }
    }

    progressTimer(self:any, type:string = 'counter') {
        if (self.active && !self.submited) {
            if (self.counter_sec > 0) {
                self.counter_sec = type == 'counter' ? self.counter_sec + 1 : self.counter_sec - 1;
                self.minutes = Math.floor(self.counter_sec / 60);
                self.minutesStr = self.minutes.toString().length < 2 ? '0' + self.minutes : self.minutes;
                self.seconds = self.counter_sec % 60;
                self.secondsStr = self.seconds.toString().length < 2 ? '0' + self.seconds : self.seconds;
            } else {
                if (self.intervalId) {
                    clearInterval(self.intervalId);
                }
            }
        }
    }

    removeTimer(timer_idx:number) {
        if (this.timers[timer_idx]) {
            delete this.timers[timer_idx];
        }
    }

    getTimer(timer_idx:number): Timer {
        return this.timers[timer_idx];
    }

    stopTimer(timer_idx:number) {
        const timer = this.timers[timer_idx];
        if (timer && timer.intervalId) {
            clearInterval(timer.intervalId);
            timer.intervalId = null;
        }
    }

    startTimer(timer_idx:number) {
        const timer = this.timers[timer_idx];
        if (timer && !timer.intervalId) {
            timer.intervalId = setInterval(this.progressTimer, 1000, timer, timer.type);
        }
    }
}
