import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {HttpClient, HttpEventType} from "@angular/common/http";
import {ApiService} from "../../services/api.service";
import {HelperService} from "../../services/helper.service";

@Component({
    selector: 'app-compare-vendors',
    templateUrl: './compare-vendors.component.html',
    styleUrls: ['./compare-vendors.component.less']
})
export class CompareVendorsComponent implements OnInit {

    @ViewChild('chat_results_scroll') chatResultsScroll: ElementRef | undefined;

    promptValue = '';
    // models = ['ChatGpt', 'Co:here'];
    selectedModel = 'chatGpt';
    chat: any = [];
    vendors: any[] = [];
    results: any = null;
    resultsTime: any = null;
    resultsError: any = null;
    chatLimit = 50;
    copyTextTimeout:any;
    copyTextSuccess:number = -1;
    chatProgress:number = -1;
    submitInProgress = false;
    scrollInProgress = false;

    uploadFilePath = ''
    fileUploadErr = ''

    constructor(
        private http: HttpClient,
        private apiService: ApiService,
        private helperService: HelperService,
    ) { }

    ngOnInit(): void {
        // this.mockData();
        this.helperService.applyTooltip();
    }

    async submitPrompt() {
        this.results = null;
        if (this.promptValue) {
            if (this.submitInProgress) {
                return;
            }
            setTimeout(() => {
                this.scrollToBottom(true);
            }, 200)
            this.limitAnswers();
            const text = this.promptValue;
            this.promptValue = '';
            // this.chat.push({text: text, model: this.selectedModel, done: true})
            // this.chat.push({text: '', model: this.selectedModel, done: false})
            this.submitInProgress = true;
            // if (this.selectedModel === 'Co:here') {
            //     this.apiService.getAnswerCohereStreaming(text).subscribe((event: any) => {
            //         this.handleSubmit(event);
            //     }, (err) => {
            //         this.submitInProgress = false;
            //     })
            // } else if (this.selectedModel === 'chatGpt') {
            //     this.apiService.getAnswerStreaming(text).subscribe((event: any) => {
            //         this.handleSubmit(event);
            //     }, (err) => {
            //         this.submitInProgress = false;
            //     })
            // }
            this.resetResults();
            const start_time = new Date();
            this.apiService.compareVendors(text).subscribe((res: any) => {
                if (!res.err) {
                    this.results = res.data.vendors_results;
                    this.vendors = res.data.vendors;
                    const end_time = new Date();
                    this.resultsTime = this.calcTookTime(start_time, end_time)
                } else {
                    this.resultsError = res.errMessage
                }
                this.submitInProgress = false;
            }, (err) => {
                this.resultsError = err
                this.submitInProgress = false;
            })
        }
    }

    resetResults() {
        this.results = null;
        this.resultsError = null;
        this.resultsTime = null;
    }

    uploadFiles(event: Event) {
        const target = event.target as HTMLInputElement;
        const files = target.files as FileList;
        this.filesDropped(files);
        target.value = ''
    }

    async filesDropped(files: FileList) {
        if (this.submitInProgress) {
            return;
        }
        const file = files[0];
        this.resetResults();
        if (file.type !== 'text/csv') {
            this.resultsError = 'please upload csv file only';
            return;
        }
        const formData = new FormData();
        formData.append('file', file, file.name);
        this.submitInProgress = true;
        const start_time = new Date();
        this.apiService.compareVendorsUpload(formData).subscribe((res: any) => {
            // console.log('res', res)
            if (!res.err) {
                this.uploadFilePath = res.file_path;
                this.results = res.data.vendors_results;
                this.vendors = res.data.vendors;
                const end_time = new Date();
                this.resultsTime = this.calcTookTime(start_time, end_time)
            } else {
                this.resultsError = res.errMessage;
            }
            this.submitInProgress = false;
        }, (err) => {
            // console.log('err', err)
            this.resultsError = err.stack;
            this.submitInProgress = false;
        })
    }



    handleSubmit(event: any) {
        // console.log('event', event)
        if (event.type === HttpEventType.DownloadProgress) {
            const partialText = event.partialText;
            if (partialText) {
                this.chat[this.chat.length - 1].text =  partialText;
                this.scrollToBottom();
            }
        }
        if (event.type === HttpEventType.Response) {
            const body = event.body;
            // console.log('body', body)
            this.submitInProgress = false;
        }
    }

    limitAnswers() {
        if (this.chat.length > this.chatLimit) {
            this.chat.shift();
        }
    }

    copyText(text: string, index: number) {
        this.copyTextSuccess = index;
        if (navigator && navigator.clipboard) {
            navigator.clipboard.writeText(text);
        }
        clearTimeout(this.copyTextTimeout);
        this.copyTextTimeout = setTimeout(() => {
            this.copyTextSuccess = -1;
        }, 1000)
    }

    scrollToBottom(force = false) {
        if (this.chatResultsScroll) {
            const element = this.chatResultsScroll.nativeElement;
            if (element) {
                // const rect = element.getBoundingClientRect();
                const fileUploadResultsElement = element.querySelector('.computer-prompt:last-child');
                // console.log('fileUploadResultsElement', fileUploadResultsElement);
                let lineHeight = 0;
                if (fileUploadResultsElement) {
                    const style = window.getComputedStyle(fileUploadResultsElement);
                    lineHeight = Math.ceil(parseFloat(style.lineHeight))
                }
                // console.log('lineHeight', lineHeight)
                // console.log('element.scrollHeight', element.scrollHeight)
                // console.log('element.scrollTop', element.scrollTop)
                // console.log('element.offsetHeight', element.offsetHeight)
                // console.log('element.scrollHeight - element.scrollTop - element.offsetHeight', Math.floor(Math.abs(element.scrollHeight - element.scrollTop - element.clientHeight)))


                if (Math.abs(element.scrollHeight - element.scrollTop - element.clientHeight) <= 1
                    || Math.floor(Math.abs(element.scrollHeight - element.scrollTop - element.clientHeight)) === lineHeight
                    || force) {
                    this.scrollInProgress = true;
                    this.chatResultsScroll.nativeElement.scrollTop = this.chatResultsScroll.nativeElement.scrollHeight;
                    setTimeout(() => {
                        if (this.chatResultsScroll && this.chatResultsScroll.nativeElement) {
                            this.chatResultsScroll.nativeElement.scrollTop = this.chatResultsScroll.nativeElement.scrollHeight;
                        }
                        this.scrollInProgress = false;
                    }, 200)
                    // $(this.chatResultsScroll.nativeElement).stop().animate({scrollTop: this.chatResultsScroll.nativeElement.scrollHeight}, 300, () => {
                    //     this.scrollInProgress = false;
                    // });
                } else {
                    // window.scrollTo(0, document.body.scrollHeight);
                }
            }
        }
    }

    preventTextAreaEnter(e: any) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
        }
    }

    mockData() {
        const d = {
            "vendors_results": [
                {
                    "input": "Hi",
                    "ChatGpt": {
                        "text": "Hello! How can I assist you today?",
                        "total_tokens": 18,
                        "cost": 0.000036
                    },
                    "CoHere": {
                        "text": "\nHow are you? I hope you're doing well.\nI'm sorry, I didn't quite understand what you meant. Could you please clarify your message?",
                        "total_tokens": 34,
                        "cost": 0.085
                    },
                    "AI21": {
                        "text": "\nHow are you? I hope you're doing well.\nI'm sorry, I didn't quite understand what you meant. Could you please clarify your message?",
                        "total_tokens": 34,
                        "cost": 0.085
                    },
                    "ChatGpt_took": "1.8109",
                    "CoHere_took": "11.2589",
                    "AI21_took": "1.8109"
                },
                {
                    "input": "How are you",
                    "ChatGpt": {
                        "text": "As an AI language model, I don't have feelings, but I'm functioning well. Thank you for asking. How can I assist you today?",
                        "total_tokens": 41,
                        "cost": 0.000082
                    },
                    "CoHere": {
                        "text": "\nI am doing well, thank you. How are you?",
                        "total_tokens": 16,
                        "cost": 0.04
                    },
                    "AI21": {
                        "text": "\nI am doing well, thank you. How are you?",
                        "total_tokens": 16,
                        "cost": 0.04
                    },
                    "ChatGpt_took": "2.4950",
                    "CoHere_took": "10.3825",
                    "AI21_took": "1.8109"
                }
            ],
            "total_took": 11.266114200000004,
            "vendors": [
                "ChatGpt",
                "CoHere",
                "AI21"
            ]
        }

        this.vendors = d.vendors;
        this.results = d.vendors_results;
        this.resultsTime = '00:00:02.874';
    }

    calcTookTime(start: Date, end: Date) {
        const duration = end.getTime() - start.getTime();
        const hours = Math.floor(duration / (1000 * 60 * 60));
        const minutes = Math.floor((duration / (1000 * 60)) % 60);
        const seconds = Math.floor((duration / 1000) % 60);
        const microseconds = Math.floor((duration % 1000) * 1000).toString().replace(/0+$/, '');
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${microseconds.toString()}`;
    }
}

class resultsDataClass {
    input: string = '';
    selected_model: string = '';
    selected_ai_model: string = '';
    output: string = '';

    constructor(obj?: any) {
        if (obj) {
            for (let key in obj) {
                if (obj[key] !== undefined && obj[key] !== null) {
                    // @ts-ignore
                    this[key] = obj[key];
                }
            }
        }
    }
}
