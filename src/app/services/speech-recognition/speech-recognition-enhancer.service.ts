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
    aggregate:string = ''
    last_aggregate_timestamp:number = -1
    

    constructor() {
    }

    countNumWordsInString(text:string){
        return text.split(/(\s+)/).filter((x) => x.trim().length>0).length
    }

    async validate(srObject:any, slideObj:any, callback:any){
        let new_result = JSON.parse(JSON.stringify(srObject));
        console.log('SR-Enhancer : validate was called')        
        const is_final = srObject.isFinal
        const slide_type = slideObj.slide_type
        const alternativeTexts = srObject.alternativeTexts
        if(this.enable_on_slide_types.includes(slide_type)){
            const target_text = slideObj.text
            if (is_final) {
                this.last_final_timestamp = Date.now()
                if(this.aggregate.length){
                    let prefix = this.aggregate
                    this.aggregate = ''
                    // const secondsDifference = Math.floor(this.last_final_timestamp - this.last_aggregate_timestamp/1000)
                    // if(secondsDifference>4) {
                    //     prefix = ''
                    // }
                    srObject.text = prefix + ' ' + srObject.text
                    console.log('SR-Enhancer : new aggregate text', srObject.text)
                }
                const asr_text = srObject.text;
                // 0 - Lets compare target and incoming text , if they are the same we are done and should return
                if(asr_text.toLowerCase() === target_text.toLowerCase()){
                    return 
                }
                console.log('SR-Enhancer : asr_text', srObject.text)
                // 1 - lets see if alternative values contain the target, if so replace to the text to the target
                if(alternativeTexts.some( (item: string) => item.toLowerCase() === target_text.toLowerCase() )){
                    console.log('SR-Enhancer : ' + srObject.text + ' - replacing word to ' + target_text)
                    srObject.text = target_text
                    return
                }
                // 2 - lets see if alternative values contain the target, if so , replace and aggregate
                const target_text_n_words   = this.countNumWordsInString(target_text)
                const incoming_text_n_words = this.countNumWordsInString(asr_text)
                if(alternativeTexts.some( (item: string) => target_text.toLowerCase().includes(item.toLowerCase()))){
                    const target_words = target_text.split(' ')
                    const replace_string = target_words.slice(0, incoming_text_n_words).join(' ')
                    console.log('SR-Enhancer : - replacing ' + srObject.text +' to ' + replace_string)
                    srObject.text = replace_string
                    if (target_text_n_words == incoming_text_n_words){
                        return
                    } else {
                        // lets add to aggregate list
                        console.log('SR-Enhancer : adding to aggregate - '+ srObject.text)
                        this.aggregate = srObject.text
                        srObject.isFinal = false
                        return
                    }
                }
                // 3 - if the text is not contained in the alternative we should probaly still aggregate
                if(target_text_n_words > incoming_text_n_words){
                    console.log('SR-Enhancer : adding to aggregate - '+ srObject.text)
                    this.aggregate = srObject.text
                    this.last_aggregate_timestamp= Date.now()
                    srObject.isFinal = false
                    return
                }
                // check word count as first validation - if word count + thr is less than target we should probably aggregate
                console.log('validate n_words_check',target_text_n_words == incoming_text_n_words)
                   
            } else {
                this.last_partial_timestamp = Date.now()
                const partial_timestamp = this.last_partial_timestamp
                //wait for is_final for a given amount of time and if no event return - emit as final
                setTimeout(() => {
                    // run  test after 1 sec to validate we are not stuck at partial
                    const should_trigger_partial_as_final = this.checkIfShouldTriggerPartial(partial_timestamp)
                    if(should_trigger_partial_as_final){
                        console.log('triggerPartialAsFinal should trigger')
                        new_result.isFinal = true
                        callback(new_result)
                    }  
                }, 1000);
            }
        }
    }
  
    checkIfShouldTriggerPartial(partial_timestamp:number){
        if(this.last_partial_timestamp>partial_timestamp || this.last_final_timestamp>partial_timestamp){
            // the status has changed in past 1 sec so we will not trigger anything
            return false
        }
        return true
    }

}