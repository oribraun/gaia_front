import {EventEmitter, Injectable} from '@angular/core';

declare var webkitSpeechRecognition:any;
@Injectable({
    providedIn: 'root'
})
export class SpeechRecognitionService {
    englishRecognition: any;
    hebrewRecognition: any;
    isListening: boolean = false;
    englishText: string = '';
    hebrewText: string = '';

    public onResults: EventEmitter<OnResults> = new EventEmitter<OnResults>();

    constructor() {}

    setupSpeechRecognition() {
        if ('webkitSpeechRecognition' in window) {
            this.englishRecognition = new webkitSpeechRecognition();
            this.englishRecognition.lang = 'en-US';
            this.englishRecognition.continuous = true;

            this.hebrewRecognition = new webkitSpeechRecognition();
            this.hebrewRecognition.lang = 'en-US';//he-IL
            this.hebrewRecognition.continuous = true;

            this.englishRecognition.addEventListener('result', this.onResultRecognitionEn);
            // this.englishRecognition.addEventListener('end', this.onEndRecognitionEn);


            this.hebrewRecognition.addEventListener('result', this.onResultRecognitionHe);
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

    onResultRecognitionHe = (event: any) => {
        const result = event.results[event.results.length - 1];
        const word = result[0].transcript;
        this.hebrewText = word;
        this.onResults.emit(
            new OnResults(word, this.hebrewRecognition.lang, result.isFinal)
        )
    }

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
        if ('webkitSpeechRecognition' in window) {
            try {
                this.englishRecognition.start();
                this.hebrewRecognition.start();
                this.isListening = true;
            } catch (e) {
                console.log('startListening Error', e)
            }
        }
    }

    stopListening(): void {
        if ('webkitSpeechRecognition' in window) {
            try {
                this.englishRecognition.stop();
                this.hebrewRecognition.stop();
                this.isListening = false;
            } catch (e) {
                console.log('stopListening Error', e)
            }
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
