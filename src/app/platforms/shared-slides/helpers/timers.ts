
export class TimersHelper {

    timers:any = {}
    counters:any = {}
    current_counter:any = {}
    current_timer:any = {}
    
    constructor() { }

    clearAllCounters(){
        this.counters = {}
    }

    clearAllTimers(){
        this.timers = {}
    }

    handleCounter(counter_idx:number, initial_value:number=0, pause_others=true){
        if(pause_others){
            this.pauseAllCounters()
        }
        if(!this.counters.hasOwnProperty(counter_idx)) {
            this.counters[counter_idx] = this.createTimer('counter', initial_value)
        } else {
            this.counters[counter_idx].active = true
        }
        this.current_counter = this.counters[counter_idx]
    }

    handleTimer(timer_idx:number, initial_value:number=0, pause_others=true){
        if(pause_others){
            this.pauseAllTimers()
        }
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
        Timer.getTime = function(){
            return this.minutesStr + ':'+this.secondsStr
        }
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