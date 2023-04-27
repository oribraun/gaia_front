import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {HttpClient, HttpEventType} from "@angular/common/http";
import {ApiService} from "../../../services/api.service";
import {User} from "../../../entities/user";
import {Config} from "../../../config";
import {lastValueFrom} from "rxjs";
const { v4: uuidv4, v5: uuidv5 } = require('uuid');

declare var $: any;
@Component({
    selector: 'app-smart-router',
    templateUrl: './smart-router.component.html',
    styleUrls: ['./smart-router.component.less']
})
export class SmartRouterComponent implements OnInit {

    user!: User;
    conversation_id = '';
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
        if (this.user) {
            this.conversation_id = this.createEmailUuid();
        }
        this.config.user_subject.subscribe((user) => {
            this.user = user;
            if (this.user) {
                this.conversation_id = this.createEmailUuid();
            }
        });
        this.getCompany()
        this.getConversationHistory()
        this.applyTooltip()
    }

    applyTooltip() {
        $(function () {
            $('[data-bs-toggle="tooltip"]').tooltip({
                trigger : 'hover'
            })
        })
    }

    async getCompany() {
        const response: any = await lastValueFrom(this.apiService.getCompany({}));
        if (!response.err) {
            this.company = response.data;
        } else {
            // this.errMessage = response.errMessage;
        }
    }

    async getConversationHistory() {
        const obj = {
            limit: this.chatLimit / 2,
            conversation_id: this.conversation_id
        }
        const response: any = await lastValueFrom(this.apiService.getConversationHistory(obj));
        if (!response.err) {
            const data = response.data;
            const chat = [];
            for (let o of data) {
                chat.push({
                    text: o.input_prompt,
                    model: this.selectedModel,
                    done: true
                })
                chat.push({
                    text: o.output_prompt,
                    model: this.selectedModel,
                    done: true
                })
            }
            this.chat = chat;
            setTimeout(() => {
                this.scrollToBottom(true);
            })
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
            const stream = true;
            this.apiService.getSmartRouter(text, this.conversation_id, stream, this.company.api_token).subscribe((event: any) => {
                this.handleSubmit(event, stream);
            }, (err) => {
                this.resultsError = err
                this.submitInProgress = false;
            })
        }
    }

    handleSubmit(event: any, stream:boolean) {
        // console.log('event', event)
        if (event.type === HttpEventType.DownloadProgress) {
            const partialText = event.partialText;
            if (partialText) {
                if (stream) {
                    this.chat[this.chat.length - 1].text = partialText;
                } else {
                    let text = 'Something Went Wrong';
                    try {
                        const response = JSON.parse(partialText)
                        text = response.data;
                        if (response.err) {
                            text = response.errMessage;
                        }
                    } catch (e) {}
                    this.chat[this.chat.length - 1].text = text;
                }
                this.scrollToBottom();
            }
        }
        if (event.type === HttpEventType.Response) {
            const body = event.body;
            // console.log('body', body)
            if (this.chat[this.chat.length - 1]) {
                this.chat[this.chat.length - 1].done = true;
            }
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

    create_uuidv5(str: string = '', hash: string = '') {
        // @ts-ignore
        let MY_NAMESPACE = '1b671a64-40d5-491e-99b0-da01ff1f3341';
        if (hash) {
            MY_NAMESPACE = hash
        }
        const u = uuidv5(str, MY_NAMESPACE);
        return u;
    };

    createEmailUuid() {
        const email = this.user.email;
        return this.create_uuidv5(email)
    }

    createEmailUuid4() {
        const email = this.user.email;
        const hash = uuidv4();
        return this.create_uuidv5(email, hash)
    }

    clearConversation() {
        this.conversation_id = this.createEmailUuid4()
        this.getConversationHistory();
    }

}
