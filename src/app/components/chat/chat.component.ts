import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ApiService} from "../../services/api.service";
import {lastValueFrom} from "rxjs";

declare var $: any;
@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.less']
})
export class ChatComponent implements OnInit {

    @ViewChild('scroller') scroller!: ElementRef;
    chatbotOptions = ['bank', 'car']
    selectedChatbot = 'bank'
    messages: any = [];
    message = '';
    inProgress = false;
    minimize = true;
    title_f_name = 'Fabio'
    title_l_name = 'Ottaviani'
    title_role = 'Support'
    Fake = [
        'Hi there, I\'m ' + this.title_f_name + ' and you?',
        'Nice to meet you',
        'How are you?',
        'Not too bad, thanks',
        'What do you do?',
        'That\'s awesome',
        'Codepen is a nice place to stay',
        'I think you\'re a nice person',
        'Why do you think that?',
        'Can you explain?',
        'Anyway I\'ve gotta go now',
        'It was a pleasure chat with you',
        'Time to make a new codepen',
        'Bye',
        ':)'
    ]
    i = 0

    constructor(
        private apiService: ApiService
    ) { }

    ngOnInit(): void {
        this.init();
        // var $messages = $('.messages-content'),
        //     d, h, m: any,
        //     i = 0;

        // $messages.mCustomScrollbar();

        function updateScrollbar() {
            // $messages.mCustomScrollbar("update").mCustomScrollbar('scrollTo', 'bottom', {
            //     scrollInertia: 10,
            //     timeout: 0
            // });
        }

        // function setDate(){
        //     d = new Date()
        //     if (m != d.getMinutes()) {
        //         m = d.getMinutes();
        //         $('<div class="timestamp">' + d.getHours() + ':' + m + '</div>').appendTo($('.message:last'));
        //     }
        // }

        // // @ts-ignore
        // function insertMessage() {
        //     const msg = $('.message-input').val();
        //     if ($.trim(msg) == '') {
        //         return false;
        //     }
        //     $('<div class="message message-personal">' + msg + '</div>').appendTo($('.mCSB_container')).addClass('new');
        //     setDate();
        //     $('.message-input').val(null);
        //     updateScrollbar();
        //     setTimeout(() => {
        //         // this.fakeMessage();
        //     }, 1000 + (Math.random() * 20) * 100);
        // }

        // $('.message-submit').click(function() {
        //     insertMessage();
        // });

        // @ts-ignore
        // $(window).on('keydown', function(e) {
        //     if (e.which == 13) {
        //         insertMessage();
        //         return false;
        //     }
        // })

        // var Fake = [
        //     'Hi there, I\'m Fabio and you?',
        //     'Nice to meet you',
        //     'How are you?',
        //     'Not too bad, thanks',
        //     'What do you do?',
        //     'That\'s awesome',
        //     'Codepen is a nice place to stay',
        //     'I think you\'re a nice person',
        //     'Why do you think that?',
        //     'Can you explain?',
        //     'Anyway I\'ve gotta go now',
        //     'It was a pleasure chat with you',
        //     'Time to make a new codepen',
        //     'Bye',
        //     ':)'
        // ]

        // // @ts-ignore
        // function fakeMessage() {
        //     if ($('.message-input').val() != '') {
        //         return false;
        //     }
        //     this.messages.push({text: '', loading: true})
        //     $('<div class="message loading new"><figure class="avatar"><img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/156381/profile/profile-80.jpg" /></figure><span></span></div>').appendTo($('.mCSB_container'));
        //     updateScrollbar();
        //
        //     // setTimeout(function() {
        //     //     $('.message.loading').remove();
        //     //     $('<div class="message new"><figure class="avatar"><img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/156381/profile/profile-80.jpg" /></figure>' + Fake[i] + '</div>').appendTo($('.mCSB_container')).addClass('new');
        //     //     setDate();
        //     //     updateScrollbar();
        //     //     i++;
        //     // }, 1000 + (Math.random() * 20) * 100);
        //
        // }
    }

    init() {
        setTimeout(() => {
            this.minimize = false
            this.inProgress = true;
            this.addMessage('', '', '', true);
            this.scrollDown(100);
            this.fakeMessage();
        }, 300)
    }

    async sendMessage(message: any, fake=false) {
        this.addMessage('', '', '', true);
        this.scrollDown(100);
        if (!fake) {
            const response: any = await lastValueFrom(this.apiService.sendToChatbot(message, this.selectedChatbot));
            if (!response.err) {
                const d = new Date()
                const m = d.getMinutes();
                const time = d.getHours() + ':' + m;
                this.setLastMessage('', response.data.answer, time, false)
                this.scrollDown(100);
                this.inProgress = false;
            } else {

            }
        } else {
            this.fakeMessage()
        }
    }

    fakeMessage() {
        // this.addMessage('', '', '', true);
        // this.scrollDown(100);
        // $('<div class="message loading new"><figure class="avatar"><img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/156381/profile/profile-80.jpg" /></figure><span></span></div>').appendTo($('.mCSB_container'));
        // updateScrollbar();

        setTimeout(() => {
            //     $('.message.loading').remove();
            //     $('<div class="message new"><figure class="avatar"><img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/156381/profile/profile-80.jpg" /></figure>' + Fake[i] + '</div>').appendTo($('.mCSB_container')).addClass('new');
            //     setDate();
            //     updateScrollbar();
            //     i++;
            const d = new Date()
            const m = d.getMinutes();
            const time = d.getHours() + ':' + m;
            this.setLastMessage('', this.Fake[this.i], time, false)
            this.scrollDown(100);
            this.i++;
            this.inProgress = false;
        }, 1000 + (Math.random() * 20) * 100);

    }

    addMessage(message: string, answer: string, time: string, loading: boolean) {
        this.messages.push({})
        this.setLastMessage(message, answer, time, loading)
    }

    setLastMessage(message: string, answer: string, time: string, loading: boolean) {
        this.messages[this.messages.length - 1].message = message
        this.messages[this.messages.length - 1].answer = answer
        this.messages[this.messages.length - 1].date = time
        this.messages[this.messages.length - 1].loading = loading
    }

    cleanMessage() {
        this.message = ''
    }

    insertMessage() {
        if (this.inProgress) {
            return;
        }
        this.inProgress = true;
        const message = this.message;
        this.addMessage(message, '', '', false)
        this.scrollDown(100);
        this.cleanMessage();
        setTimeout(async () => {
            await this.sendMessage(message);
        }, 1000 + (Math.random() * 20) * 100 * 0)
    }

    setMinimize() {
        this.minimize = true;
    }
    setMaximize() {
        this.minimize = false;
    }

    onKeyDown(e: any) {
        if (e.which == 13) {
            this.insertMessage();
            e.preventDefault();
        }
    }

    scrollDown(timeout=300) {
        setTimeout(() => {
            if (this.scroller) {
                const element = this.scroller.nativeElement;
                console.log('ement', element.scrollHeight)
                element.scrollTop = element.scrollHeight
                // if (element) {
                //     element.animate({
                //         scrollTop: element.scrollHeight
                //     }, 300);
                // }
            }
        }, timeout)
    }

}
