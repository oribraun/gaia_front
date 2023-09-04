import {EventEmitter, Injectable} from '@angular/core';

declare var webkitSpeechRecognition:any;
declare var SpeechRecognition:any;

@Injectable({
    providedIn: 'root'
})
export class SpeechRecognitionService {
    englishRecognition: any;
    hebrewRecognition: any;
    isListening: boolean = false;
    englishText: string = '';
    hebrewText: string = '';
    ASR_recognizing:boolean=false;

    public onResults: EventEmitter<OnResults> = new EventEmitter<OnResults>();

    constructor() {}

    setupSpeechRecognition() {
        let self = this
        let recognitionClass = null;
        if ('webkitSpeechRecognition' in window) {
            recognitionClass = webkitSpeechRecognition;
        } else if ('SpeechRecognition' in window) {
            recognitionClass = SpeechRecognition;
        }
        if (recognitionClass) {
            this.englishRecognition = new recognitionClass();
            this.englishRecognition.lang = 'en-US';
            this.englishRecognition.continuous = true;
            this.englishRecognition.interimResults = true

            // this.hebrewRecognition = new recognitionClass();
            // this.hebrewRecognition.lang = 'en-US';//he-IL
            // this.hebrewRecognition.continuous = true;
            // this.hebrewRecognition.interimResults = true

            this.englishRecognition.addEventListener('result', this.onResultRecognitionEn);
            // this.englishRecognition.addEventListener('end', this.onEndRecognitionEn);

            this.englishRecognition.onstart = function () {
                self.ASR_recognizing = true;
                console.log('EN ASR ON START', self.ASR_recognizing)
            };
            this.englishRecognition.onend = function () {
                self.ASR_recognizing = false;
                console.log('EN ASR ON END', self.ASR_recognizing)

            };
            // this.hebrewRecognition.onstart = function () {
            //     self.ASR_recognizing = true;
            //     console.log('HE ASR ON START', self.ASR_recognizing)
            // };
            // this.hebrewRecognition.onend = function () {
            //     self.ASR_recognizing = false;
            //     console.log('HE ASR ON END', self.ASR_recognizing)
            // };
            // this.hebrewRecognition.addEventListener('result', this.onResultRecognitionHe);
            // this.hebrewRecognition.addEventListener('end', this.onEndRecognitionHe);
        } else {
            console.error('Speech recognition not supported in this browser.');
        }
    }


    onResultRecognitionEn = (event: any) => {
        const result = event.results[event.results.length - 1];
        const word = result[0].transcript;
        this.onResults.emit(
            new OnResults(word, this.englishRecognition.lang, result.isFinal)
        )
    }

    onEndRecognitionEn = (event: any) => {
        console.log('onEndRecognitionEn event', event)
    }

    // onResultRecognitionHe = (event: any) => {
    //     const result = event.results[event.results.length - 1];
    //     const word = result[0].transcript;
    //     this.hebrewText = word;
    //     this.onResults.emit(
    //         new OnResults(word, this.hebrewRecognition.lang, result.isFinal)
    //     )
    // }

    onEndRecognitionHe = (event: any) => {
        console.log('onEndRecognitionHe event', event)
    }


    toggleListening(): void {
        if (this.isListening) {
            this.stopListening();
        } else {
            this.startListening();
        }
    }

    startListening(): void {
        try {
            if (this.englishRecognition)
                this.englishRecognition.start();
            // if (this.hebrewRecognition)
            //     this.hebrewRecognition.start();
            this.isListening = true;
        } catch (e) {
            console.log('startListening Error', e)
        }
    }

    stopListening(): void {
        try {
            if (this.englishRecognition)
                this.englishRecognition.stop();
            // if (this.hebrewRecognition)
            //     this.hebrewRecognition.stop();
            this.isListening = false;
        } catch (e) {
            console.log('stopListening Error', e)
        }
    }
    abortListening(): void {
        try {
            if (this.englishRecognition)
                this.englishRecognition.abort();
            // if (this.hebrewRecognition)
            //     this.hebrewRecognition.abort();
            this.isListening = false;
        } catch (e) {
            console.log('stopListening Error', e)
        }
    }
}

class OnResults {
    text!: string;
    lang!: string;
    isFinal!: boolean;

    constructor(text: string, lang: string, isFinal: boolean) {
        this.text = text;
        this.lang = lang;
        this.isFinal = isFinal;
    }
}
