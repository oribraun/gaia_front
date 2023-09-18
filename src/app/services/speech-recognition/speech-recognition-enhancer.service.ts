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

    validate(srObject:any, slideObj:any, stop:number=0){
        // let new_result = JSON.parse(JSON.stringify(srObject));
        console.log('validate was called')
        console.log(srObject)
        console.log(slideObj)
        const asr_text = srObject.text;
        const is_final = srObject.isFinal
        const slide_type = slideObj.slide_type
        const alternativeTexts = srObject.alternativeTexts
        if(this.enable_on_slide_types.includes(slide_type)){
            const target_text = slideObj.text
            if (is_final) {
                this.last_final_timestamp = Date.now()
                // check word count as first validation - if word count + thr is less than target we should probably aggregate
                const target_text_n_words = this.countNumWordsInString(target_text)
                const incoming_text_n_words = this.countNumWordsInString(asr_text)
                console.log('validate n_words_check',target_text_n_words == incoming_text_n_words)
                if(alternativeTexts.some( (item: string) => item.toLowerCase() === target_text.toLowerCase() )){
                    console.log(srObject.text + ' - replacing word to ' + target_text)
                    srObject.text = target_text
                }
                // return new_result
            } else {
                // if(stop==0){
                //     this.last_partial_timestamp = Date.now()
                //     const partial_timestamp = this.last_partial_timestamp
                //     // wait for is_final for a given amount of time and if no event return - emit as final
                //     setTimeout(() => {
                //         // run  test after 1 sec to validate we are not stuck at partial
                //         const should_trigger_partial_as_final = this.checkIfShouldTriggerPartial(partial_timestamp)
                //         if(should_trigger_partial_as_final){
                //             new_result.final=true
                //             console.debug('triggerPartialAsFinal should trigger')
                //             return this.validate(new_result, slideObj,1)
                //         } else {
                //             return new_result
                //         }
                         
                //     }, 1000);
                // }
                // return new_result
            }
        }
        // return new_result
    }
  
    checkIfShouldTriggerPartial(partial_timestamp:number){
        if(this.last_partial_timestamp>partial_timestamp || this.last_final_timestamp>partial_timestamp){
            // the status has changed in past 1 sec so we will not trigger anything
            return false
        }
        return true
    }

}