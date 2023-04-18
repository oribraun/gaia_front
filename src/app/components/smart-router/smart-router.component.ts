import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {HttpClient, HttpEventType} from "@angular/common/http";
import {ApiService} from "../../services/api.service";
import {User} from "../../entities/user";
import {Config} from "../../config";
import {lastValueFrom} from "rxjs";

@Component({
  selector: 'app-smart-router',
  templateUrl: './smart-router.component.html',
  styleUrls: ['./smart-router.component.less']
})
export class SmartRouterComponent implements OnInit {

    user!: User;
    company: any;
    @ViewChild('chat_results_scroll') chatResultsScroll: ElementRef | undefined;

    promptValue = '';
    models = ['chatGpt', 'Co:here'];
    selectedModel = 'chatGpt';
    chat: any = [];
    results: any = null;
    vendors = ['chatGpt', 'coHere'];
    resultsError = null;
    chatLimit = 50;
    copyTextTimeout:any;
    copyTextSuccess:number = -1;
    chatProgress:number = -1;
    submitInProgress = false;
    scrollInProgress = false;
    constructor(
        private config: Config,
        private http: HttpClient,
        private apiService: ApiService
    ) { }

    ngOnInit(): void {
        this.user = this.config.user;
        this.config.user_subject.subscribe((user) => {
            this.user = user;
        });
        this.getCompany()
    }

    async getCompany() {
        const response: any = await lastValueFrom(this.apiService.getCompany({}));
        if (!response.err) {
            this.company = response.data;
        } else {
            // this.errMessage = response.errMessage;
        }
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
            this.chat.push({text: text, model: this.selectedModel, done: true})
            this.chat.push({text: '', model: this.selectedModel, done: false})
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
            this.apiService.getSmartRouter(text, this.company.api_token).subscribe((event: any) => {
                this.handleSubmit(event);
            }, (err) => {
                this.resultsError = err
                this.submitInProgress = false;
            })
        }
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

}
