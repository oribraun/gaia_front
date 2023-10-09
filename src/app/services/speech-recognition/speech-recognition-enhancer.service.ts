import {EventEmitter, Injectable} from '@angular/core';
import {environment} from "../../../environments/environment";
import {Presentation, PresentationSection, PresentationSlide} from "../../entities/presentation";

@Injectable({
    providedIn: 'root'
})
export class SpeechRecognitionEnhancerService {

    // enable_on_slide_types:string[] = ["word_repeater"]
    enable_on_slide_types:string[] = ["word_repeater", "reading"]
    enable_on_min_delay_slide_types:string[] = ["video", "writing","template"]
    min_delay = 2000
    lines:string[] = []
    last_partial_timestamp:number = -1
    lastPartialTimeout: any = null;
    lastFinalTimeout: any = null;
    last_final_timestamp:number = -1
    aggregate:string = ''
    last_aggregate_timestamp:number = -1
    slide_index:number = -1
    line_index:number = 0
    asr_queue:string[] = []

    


    constructor() {
    }

    countNumWordsInString(text:string){
        return text.split(/(\s+)/).filter((x) => x.trim().length>0).length
    }

    levenshteinDistance(str1 = '', str2 = '') {
        const track = Array(str2.length + 1).fill(null).map(() =>
            Array(str1.length + 1).fill(null));
        for (let i = 0; i <= str1.length; i += 1) {
            track[0][i] = i;
        }
        for (let j = 0; j <= str2.length; j += 1) {
            track[j][0] = j;
        }
        for (let j = 1; j <= str2.length; j += 1) {
            for (let i = 1; i <= str1.length; i += 1) {
                const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
                track[j][i] = Math.min(
                    track[j][i - 1] + 1, // deletion
                    track[j - 1][i] + 1, // insertion
                    track[j - 1][i - 1] + indicator, // substitution
                );
            }
        }
        return track[str2.length][str1.length];
    };

    removePunct(s:string){
        var punctuationless = s.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
        var finalString = punctuationless.replace(/\s{2,}/g," ");
        return finalString
    }


    async validate(srObject:any, slideObj:any, callback:any, slide_index:number =-1){
        const is_final = srObject.isFinal
        this.last_final_timestamp = Date.now()
        if(this.enable_on_min_delay_slide_types.includes(slideObj.slide_type)){
            console.log('SR-Enhancer : validate was called')
            if (is_final) {
                this.asr_queue.push(srObject.text.replace(/\s\s+/g, ' ').trim())
                srObject.isFinal = false
                this.waitForSlienceToTransmit(srObject,callback)
            }
        }

        if(this.enable_on_slide_types.includes(slideObj.slide_type)){
            console.log('SR-Enhancer : validate was called')
            const alternativeTexts = srObject.alternativeTexts
            const asr_text_raw = srObject.text.replace(/\s\s+/g, ' ').trim();
            const asr_text_raw_lower = asr_text_raw.toLowerCase()
            const asr_text = this.GetNormalizedAsrText(srObject.text, is_final);
            const asr_text_lower = asr_text.toLowerCase()
            const asr_text_raw_lower_no_punct = this.removePunct(asr_text_raw_lower)
            const asr_text_lower_no_punct = this.removePunct(asr_text_lower)
            const raw_incoming_text_n_words = this.countNumWordsInString(asr_text_raw)
            const incoming_text_n_words = this.countNumWordsInString(asr_text)
            const thr = Math.max(2, incoming_text_n_words)

            let target_text = ''
            let target_text_lower = ''
            let target_text_lower_no_punct = ''
            let target_text_lower_words:any[] = []
            let target_text_n_words = 0

            if (is_final) {

                if(slideObj.slide_type == 'reading'){
                    if(this.slide_index != slide_index){
                        this.slide_index = slide_index
                        this.lines = slideObj.text.replace(/\s\s+/g, ' ').trim().split('\n')
                        this.resetLineIndex();
                    }
                    target_text = this.lines[this.line_index]
                } else {
                    target_text = slideObj.text.replace(/\s\s+/g, ' ').trim()
                    this.resetLineIndex();
                }
                target_text_lower = target_text.toLowerCase()
                target_text_lower_no_punct = this.removePunct(target_text_lower)
                target_text_lower_words = target_text_lower.split(' ')
                target_text_n_words = this.countNumWordsInString(target_text)

                console.log('SR-Enhancer : Final ASR Got | ASR RAW = ' + asr_text_raw_lower + ' | ASR = ' + asr_text_lower +' | Target = '+ target_text_lower)

                
                // 0) Compare target to raw incoming
                if(asr_text_raw_lower_no_punct.includes(target_text_lower_no_punct)) {
                    srObject.text = target_text
                    console.log('SR-Enhancer : Compare target to raw incoming test passed | ASR RAW = ' + asr_text_raw_lower + ' | Target = '+ target_text_lower)
                    this.aggregate = ''
                    this.line_index+=1
                    return
                }

                // 1) Compare target to normalized incoming
                if(asr_text_lower_no_punct.includes(target_text_lower_no_punct)) {
                    srObject.text = target_text
                    console.log('SR-Enhancer : Compare target to normalized incoming test passed | ASR RAW = ' + asr_text_raw_lower + ' | ASR = ' + asr_text_lower +' | Target = '+ target_text_lower)
                    this.aggregate = ''
                    this.line_index+=1
                    return
                }

                // 2 - Levenshtein Distance between the target and incoming is less than thr, accpet the answer
                if (this.levenshteinDistance(target_text_lower_no_punct, asr_text_lower_no_punct) < thr){
                    console.log('SR-Enhancer : Levenshtein Distance test passed | ASR RAW = ' + asr_text_raw_lower + ' | ASR = ' + asr_text_lower +' | Target = '+ target_text_lower + ' LD = ' + this.levenshteinDistance(target_text_lower, asr_text_lower))
                    srObject.text = target_text
                    this.aggregate = ''
                    this.line_index+=1
                    return
                }

                // 3 - Alternative values contains the target, if so replace to the text to the target
                if(alternativeTexts.some( (item: string) => this.removePunct(item.toLowerCase()).includes(target_text_lower_no_punct) )){
                    console.log('SR-Enhancer : Alternative values test passed - ' + srObject.text + ' replaced by ' + target_text)
                    srObject.text = target_text
                    this.aggregate = ''
                    this.line_index+=1
                    return
                }

                //=====================================================================================
                // If no one of the above scenarios tooke place we need to see if we should aggregate
                //=====================================================================================

                // 0 - Incoming ASR is a starting substring of the target text - in this case lets aggregate
                if(target_text_lower_no_punct.startsWith(asr_text_lower_no_punct)) {
                    console.log('SR-Enhancer : Aggregate substing values test passed - ' + asr_text_lower_no_punct + ' was set as the aggregate value, target is ' + target_text_lower_no_punct)
                    this.aggregate = asr_text_lower_no_punct
                    srObject.isFinal = false
                    return
                }

                // 1 - One of the incoming ASR permutations is substring of the target text - in this case lets aggregate
                for(let altText of alternativeTexts){
                    altText = this.aggregate + ' ' + altText.toLowerCase()
                    altText = altText.replace(/\s\s+/g, ' ').trim()
                    const altText_n_words = this.countNumWordsInString(altText)
                    const target_string = target_text_lower_words.slice(0, altText_n_words).join(' ').trim()
                    if(target_text_lower.startsWith(altText)) {
                        console.log('SR-Enhancer : Aggregate permutations substing values test passed - ' + target_string + ' was set as the aggregate value')
                        this.aggregate = target_string
                        srObject.isFinal = false
                        return
                    }
                    if (this.levenshteinDistance(target_string, altText) < thr){
                        console.log('SR-Enhancer : Aggregate permutations levenshteinDistance substing values test passed - ' + target_string + ' was set as the aggregate value')
                        this.aggregate = target_string
                        srObject.isFinal = false
                        return
                    }
                }

            } else {
                this.last_partial_timestamp = Date.now()
                this.checkAndForcePartial(srObject, callback);
                //wait for is_final for a given amount of time and if no event return - emit as final

            }
        }
    }

    waitForSlienceToTransmit(srObject: any, callback: any, delay:any = 2200) {
        const final_timestamp = this.last_final_timestamp
        let new_result = JSON.parse(JSON.stringify(srObject));
        clearTimeout(this.lastFinalTimeout)
        this.lastFinalTimeout = setTimeout(() => {
            // run  test after 1 sec to validate we are not stuck at partial
            const should_trigger_final = this.checkIfShouldTriggerFinal(final_timestamp)
            if(should_trigger_final){
                new_result.text = this.asr_queue.join(' ')
                this.asr_queue = []
                console.log('SR-Enhancer : Final should be triggered - ' + new_result )
                new_result.isFinal = true
                callback(new_result, false)
            }
        }, delay);
    }

    resetLineIndex() {
        this.line_index = 0
    }

    checkAndForcePartial(srObject: any, callback: any) {
        const partial_timestamp = this.last_partial_timestamp
        let new_result = JSON.parse(JSON.stringify(srObject));
        clearTimeout(this.lastPartialTimeout)
        this.lastPartialTimeout = setTimeout(() => {
            // run  test after 1 sec to validate we are not stuck at partial
            const should_trigger_partial_as_final = this.checkIfShouldTriggerPartial(partial_timestamp)
            if(should_trigger_partial_as_final){
                console.log('SR-Enhancer : Partial should be final - ' + new_result )
                new_result.isFinal = true
                callback(new_result, false)
            }
        }, 1000);
    }

    GetNormalizedAsrText(text: string, is_final:boolean) {
        if(is_final==true && this.aggregate.length>0){
            let new_text:string =  this.aggregate + ' ' + text
            new_text = new_text.replace(/\s\s+/g, ' ').trim();
            return new_text
        }
        return text
    }

    checkIfShouldTriggerFinal(final_timestamp:number){
        if(this.last_final_timestamp>final_timestamp || this.last_partial_timestamp>final_timestamp){
            // the status has changed in past 1 sec so we will not trigger anything
            return false
        }
        return true
    }

    checkIfShouldTriggerPartial(partial_timestamp:number){
        if(this.last_partial_timestamp>partial_timestamp || this.last_final_timestamp>partial_timestamp){
            // the status has changed in past 1 sec so we will not trigger anything
            return false
        }
        return true
    }

}
