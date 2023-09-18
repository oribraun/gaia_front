import {EventEmitter, Injectable} from '@angular/core';
import {environment} from "../../../environments/environment";
import {Presentation, PresentationSection, PresentationSlide} from "../../entities/presentation";

@Injectable({
    providedIn: 'root'
})
export class SpeechRecognitionEnhancerService {
    
    enable_on_slide_types:string[] = ["word_repeater", "reading"]
    last_partial_timestamp:number = -1
    last_final_timestamp:number = -1

    constructor() {
    }

    countNumWordsInString(text:string){
        return text.split(/(\s+)/).filter((x) => x.trim().length>0).length
    }

    shouldAggregate(srObject:any, slideObj:any){
        console.log('shouldAggregate was called')
        console.log(srObject)
        console.log(slideObj)
        const asr_text = srObject.text;
        const is_final = srObject.isFinal
        const slide_type = slideObj.slide_type
        if(this.enable_on_slide_types.includes(slide_type)){
            const target_text = slideObj.text
            if (is_final) {
                this.last_final_timestamp = Date.now()
                // check word count as first validation - if word count + thr is less than target we should probably aggregate
                const target_text_n_words = this.countNumWordsInString(target_text)
                const incoming_text_n_words = this.countNumWordsInString(asr_text)
                console.log('shouldAggregate n_words_check',target_text_n_words == incoming_text_n_words)


            } else {
                this.last_partial_timestamp = Date.now()
                const partial_timestamp = this.last_partial_timestamp
                // wait for is_final for a given amount of time and if no event return - emit as final
                setTimeout(() => {
                    // run  test after 1 sec to validate we are not stuck at partial
                    const should_trigger_partial_as_final = this.checkIfShouldTriggerPartial(partial_timestamp)
                    if(should_trigger_partial_as_final){
                        this.triggerPartialAsFinal(asr_text)
                    }
                     
                }, 1000);
                  
            }
        }
    }

    triggerPartialAsFinal(asr_text: string) {
        console.log('triggerPartialAsFinal should trigger : ', asr_text)
        throw new Error('Method not implemented.');
    }

    checkIfShouldTriggerPartial(partial_timestamp:number){
        if(this.last_partial_timestamp>partial_timestamp || this.last_final_timestamp>partial_timestamp){
            // the status has changed in past 1 sec so we will not trigger anything
            return false
        }
        return true
    }

}