import {EventEmitter, Injectable} from '@angular/core';
import {environment} from "../../../../../environments/environment";

declare let webkitSpeechRecognition:any;
declare let SpeechRecognition:any;

@Injectable({
    providedIn: 'root'
})
export class SpeechRecognitionService {
    mainRecognition: any;
    ASR_recognizing: boolean = false;
    startingRecognition = false;
    stoppingRecognition = false;
    abortingRecognition = false;

    originalLang: string = '';
    currentLang: string = '';
    nativeLang: string = '';

    public onResults: EventEmitter<OnResults> = new EventEmitter<OnResults>();
    public onPTTResults: EventEmitter<OnResults> = new EventEmitter<OnResults>();

    public PTTInProgress = false;

    constructor() {}

    setupSpeechRecognition(lang:string = 'en-US', nativeLang = 'he-IL') {
        this.originalLang = lang;
        console.log('this.originalLan', this.originalLang);
        this.nativeLang = nativeLang;
        let recognitionClass = null;
        if ('webkitSpeechRecognition' in window) {
            recognitionClass = webkitSpeechRecognition;
        } else if ('SpeechRecognition' in window) {
            recognitionClass = SpeechRecognition;
        }
        if (recognitionClass) {
            this.mainRecognition = new recognitionClass();
            this.mainRecognition.lang = this.originalLang; //'en-US';
            // this.englishRecognition.lang = 'he-IL';
            this.mainRecognition.continuous = true;
            this.mainRecognition.interimResults = true;
            this.mainRecognition.maxAlternatives = 5;

            this.mainRecognition.addEventListener('result', this.onResultRecognition);

            this.mainRecognition.onnomatch = (event: any) => {
                console.log('ASR ON NO MATCH', event);
            };
            this.mainRecognition.onerror = (event: any) => {
                console.log('ASR ON ERROR', event);
            };
            this.mainRecognition.onend = () => {
                if (this.ASR_recognizing && !this.startingRecognition) {
                    this.startListening();
                }
                console.log('ASR ON END TIMEOUT', this.ASR_recognizing);
            };
        } else {
            console.error('Speech recognition not supported in this browser.');
        }
    }


    onResultRecognition = (event: any) => {
        const results = event.results[event.results.length - 1];
        const allResults = [];
        for (let i = 0; i < results.length; i++) {
            allResults.push(results[i]);
        }
        allResults.sort((o1: any, o2: any) => o2.confidence - o1.confidence);
        console.log('allResults', allResults);
        const allTranscripts = allResults.map((o: any) => o.transcript);
        const mainSentence = allTranscripts.shift();
        const alternativeWords = allResults.map((o: any) => o.transcript);
        if (environment.is_mock) {
            console.log('result mainSentence mock', mainSentence);
            console.log('result alternativeWords mock', alternativeWords);
        }
        if (!this.PTTInProgress) {
            this.onResults.emit(
                new OnResults(mainSentence, alternativeWords, this.mainRecognition.lang, results.isFinal)
            );
        } else {
            this.onPTTResults.emit(
                new OnResults(mainSentence, alternativeWords, this.mainRecognition.lang, results.isFinal)
            );
        }
    };

    onEndRecognition = (event: any) => {
        console.log('onEndRecognitionEn event', event);
    };


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
                if (this.mainRecognition) {
                    this.startingRecognition = true;
                    this.mainRecognition.start();
                    this.mainRecognition.onstart = () => {
                        this.ASR_recognizing = true;
                        console.log('EN ASR ON START', this.mainRecognition.lang);
                        this.startingRecognition = false;
                        resolve(true);
                    };
                } else {
                    console.log('englishRecognition not setup');
                    resolve(false);
                }
            } catch (e) {
                console.log('startListening Error', e);
                resolve(false);
            }
        });
    }

    stopListening(): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                if (this.mainRecognition) {
                    this.stoppingRecognition = true;
                    this.mainRecognition.stop();
                    const origEndEvent = this.mainRecognition.onend;
                    this.mainRecognition.onend = () => {
                        this.ASR_recognizing = false;
                        console.log('stopListening EN ASR ON END', this.ASR_recognizing);
                        this.stoppingRecognition = false;
                        if(this.startingRecognition) {
                            this.startingRecognition = false;
                        }
                        this.mainRecognition.onend = origEndEvent;
                        resolve(true);
                    };
                    this.ASR_recognizing = false;
                } else {
                    console.log('englishRecognition not setup');
                    resolve(false);
                }
            } catch (e) {
                console.log('stopListening Error', e);
                resolve(false);
            }
        });
    }
    abortListening(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            try {
                if (this.mainRecognition) {
                    this.abortingRecognition = true;
                    this.mainRecognition.abort();
                    this.mainRecognition.onend = () => {
                        this.ASR_recognizing = false;
                        console.log('abortListening EN ASR ON END', this.ASR_recognizing);
                        this.abortingRecognition = false;
                        if(this.startingRecognition) {
                            this.startingRecognition = false;
                        }
                        resolve(true);
                    };
                } else {
                    console.log('englishRecognition not setup');
                    resolve(false);
                }
            } catch (e) {
                console.log('stopListening Error', e);
                resolve(false);
            }
        });
    }

    changeLang(lang: string) {
        if (lang) {
            // TODO verify lang supported
            this.currentLang = lang;
            this.mainRecognition.lang = this.currentLang;
        }
    }

    changeToNativeLang() {
        if (this.nativeLang) {
            // TODO verify lang supported
            this.currentLang = this.nativeLang;
            this.mainRecognition.lang = this.currentLang;
        }
    }

    resetLang() {
        this.currentLang = this.originalLang;
        this.mainRecognition.lang = this.currentLang;
    }

    activateNativeLang(isPTT = false) {
        if (this.mainRecognition.lang === this.nativeLang) {
            return;
        }
        if (this.mainRecognition) {
            if (isPTT) {
                this.PTTInProgress = true;
            }
            if (this.ASR_recognizing) {
                this.stopListening().then(() => {
                    this.changeToNativeLang();
                    this.startListening();
                });
            } else {
                this.changeToNativeLang();
                this.startListening();
            }
        }
    }
    resetToOrigLang () {
        if (this.mainRecognition.lang === this.originalLang) {
            return;
        }
        if (this.mainRecognition) {
            if (this.ASR_recognizing) {
                this.stopListening().then(() => {
                    this.onEndChangeLang();
                });
            } else {
                this.onEndChangeLang();
            }
        }
    }

    onEndChangeLang() {
        if (this.PTTInProgress) {
            this.PTTInProgress = false;
        }
        this.resetLang();
        this.startListening();
    }
}

class OnResults {
    text!: string;
    alternativeTexts!: string[];
    lang!: string;
    isFinal!: boolean;

    constructor(text: string, alternativeTexts: string[], lang: string, isFinal: boolean) {
        this.text = text;
        this.alternativeTexts = alternativeTexts;
        this.lang = lang;
        this.isFinal = isFinal;
    }
}
