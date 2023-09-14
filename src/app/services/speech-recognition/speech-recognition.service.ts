import {EventEmitter, Injectable} from '@angular/core';
import {environment} from "../../../environments/environment";

declare var webkitSpeechRecognition:any;
declare var SpeechRecognition:any;

@Injectable({
    providedIn: 'root'
})
export class SpeechRecognitionService {
    englishRecognition: any;
    hebrewRecognition: any;
    ASR_recognizing: boolean = false;
    englishText: string = '';
    hebrewText: string = '';
    startingRecognition = false;
    stoppingRecognition = false;
    abortingRecognition = false;

    originalLang: string = '';
    currentLang: string = '';

    public onResults: EventEmitter<OnResults> = new EventEmitter<OnResults>();

    constructor() {}

    setupSpeechRecognition(lang:string='en-US') {
        this.originalLang = lang;
        console.log('here1')
        let recognitionClass = null;
        if ('webkitSpeechRecognition' in window) {
            recognitionClass = webkitSpeechRecognition;
        } else if ('SpeechRecognition' in window) {
            recognitionClass = SpeechRecognition;
        }
        if (recognitionClass) {
            console.log('here2')
            this.englishRecognition = new recognitionClass();
            this.englishRecognition.lang = this.originalLang; //'en-US';
            // this.englishRecognition.lang = 'he-IL';
            this.englishRecognition.continuous = true;
            this.englishRecognition.interimResults = true

            // this.hebrewRecognition = new recognitionClass();
            // this.hebrewRecognition.lang = 'en-US';//he-IL
            // this.hebrewRecognition.continuous = true;
            // this.hebrewRecognition.interimResults = true

            this.englishRecognition.addEventListener('result', this.onResultRecognitionEn);
            // this.englishRecognition.addEventListener('end', this.onEndRecognitionEn);

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
        if (environment.is_mock) {
            console.log('result mock', result)
        }
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
        if (this.ASR_recognizing) {
            this.stopListening();
        } else {
            this.startListening();
        }
    }

    startListening(): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                if (this.englishRecognition) {
                    this.startingRecognition = true;
                    this.englishRecognition.start();
                    this.englishRecognition.onstart = () => {
                        this.ASR_recognizing = true;
                        console.log('EN ASR ON START', this.ASR_recognizing)
                        this.startingRecognition = false;
                        resolve(true)
                    };
                    // if (this.hebrewRecognition)
                    //     this.hebrewRecognition.start();
                } else {
                    console.log('englishRecognition not setup')
                    resolve(false)
                }
            } catch (e) {
                console.log('startListening Error', e)
                resolve(false)
            }
        });
    }

    stopListening(): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                if (this.englishRecognition) {
                    this.stoppingRecognition = true;
                    this.englishRecognition.stop();
                    this.englishRecognition.onend = () => {
                        this.ASR_recognizing = false;
                        console.log('stopListening EN ASR ON END', this.ASR_recognizing)
                        this.stoppingRecognition = false;
                        if(this.startingRecognition) {
                            this.startingRecognition = false;
                        }
                        resolve(true)
                    };
                    // if (this.hebrewRecognition)
                    //     this.hebrewRecognition.stop();
                    this.ASR_recognizing = false;
                } else {
                    console.log('englishRecognition not setup')
                    resolve(false)
                }
            } catch (e) {
                console.log('stopListening Error', e)
                resolve(false)
            }
        });
    }
    abortListening(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            try {
                if (this.englishRecognition) {
                    this.abortingRecognition = true;
                    this.englishRecognition.abort();
                    this.englishRecognition.onend = () => {
                        this.ASR_recognizing = false;
                        console.log('abortListening EN ASR ON END', this.ASR_recognizing)
                        this.abortingRecognition = false;
                        if(this.startingRecognition) {
                            this.startingRecognition = false;
                        }
                        resolve(true)
                    };
                    // if (this.hebrewRecognition)
                    //     this.hebrewRecognition.abort();
                } else {
                    console.log('englishRecognition not setup')
                    resolve(false)
                }
            } catch (e) {
                console.log('stopListening Error', e)
                resolve(false)
            }
        })
    }

    changeLang(lang: string) {
        if (lang) {
            // TODO verify lang supported
            this.currentLang = lang;
            this.englishRecognition.lang = this.currentLang;
        }
    }

    resetLang() {
        this.currentLang = this.originalLang;
        this.englishRecognition.lang = this.currentLang;
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
