import {
    AfterViewInit,
    Component,
    ElementRef,
    HostListener, Inject,
    Input, OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {Config} from "../../../main/config";
import {BaseSlideComponent} from "../base-slide.component";
import {LessonService} from "../../../main/services/lesson/lesson.service";
import {ChatMessage} from "../../entities/chat_message";
import {environment} from "../../../../../environments/environment";
import {SpeechRecognitionService} from "../../../main/services/speech-recognition/speech-recognition.service";
import {HelperService} from "../../../main/services/helper.service";

declare var $: any;
declare var apiRTC: any;

// const apiKey = "ODU1NDg1MThlOGEwNDMxMGI1OGIzOTc1NjUwNzUzNGUtMTcwMTM2NDI2NQ=="
const apiKey = "M2Y5ZTgzM2JhZDJlNDEwNGE1MDlkM2MxM2U1ZjQwNmYtMTcwMDkyOTMyMQ=="
const SERVER_URL = "https://api.heygen.com";
// https://github.com/HeyGen-Official/RealtimeAvatarDemo/blob/main/index.js

export enum PlayerState
{
    UNSTARTED = -1,
    ENDED = 0,
    PLAYING = 1,
    PAUSED = 2,
    BUFFERING = 3,
    CUED = 5
}
export interface OnStateChangeEvent
{
    /**
     * New player state.
     */
    data: PlayerState;
    target:any;
}

@Component({
    selector: 'app-video-ielts',
    templateUrl: './video-ielts.component.html',
    styleUrls: ['./video-ielts.component.less'],
    encapsulation: ViewEncapsulation.None
})
export class VideoIeltsComponent extends BaseSlideComponent implements OnInit, AfterViewInit, OnDestroy {
    private document!: Document;
    @ViewChild('video', { static: false }) video!: ElementRef;
    @ViewChild('teacher', { static: false }) teacher!: ElementRef;
    @ViewChild('scroller', { static: false }) scroller!: ElementRef;
    @ViewChild('heygenMediaElement', { static: false }) heygenMediaElement!: ElementRef;

    embeddedVideo: SafeHtml;

    loading_player = false;

    videoHeight: any;
    videoWidth: any;

    currentState: number = -1;
    currentStateTimeout: any = null;
    stateTimeout = 150;

    messages: ChatMessage[] = [];

    message = "";

    notes = "";

    showPanel = false;

    recognitionSubscribe: any

    replayInProgress = false;

    showSpinner = false;

    drag: any = {
        mousedown: false,
        startPos: null,
        width: 300,
        maxWidth: 500,
        minWidth: 200
    }

    dragStarted = false;

    // HEYGEN
    sessionInfo: any = null;
    peerConnection: any = null;

    constructor(
        protected override config: Config,
        private sanitizer: DomSanitizer,
        protected override lessonService: LessonService,
        private speechRecognitionService: SpeechRecognitionService,
        private helperService: HelperService,
        @Inject(DOCUMENT) document?: any
    ) {
        super(config, lessonService)
        this.document = document;
        this.embeddedVideo =""

        if (environment.is_mock) {
            this.messages = [
                new ChatMessage({type: 'computer', message: 'Hi'}),
                new ChatMessage({type: 'user', message: 'Hello'}),
            ]
        }
    }
    override ngOnInit(): void {
        super.ngOnInit();
        this.showPanel = true;
        setTimeout(() => {
            this.scrollToBottom2();
        });
        // this.createVideo();

        this.lessonService.ListenFor("student_reply_response").subscribe((resp:any) => {
            try {
                let resp_data = resp.data
                if (resp_data && resp_data.text) {
                    this.messages.push(
                        new ChatMessage({type: 'user', message: resp_data.text})
                    );
                    this.scrollToBottom2();
                }
            } catch (e) {}
        })
        this.lessonService.ListenFor("audio_finished").subscribe((resp:any) => {
            console.log('audio_finished')
            if (!this.recognitionSubscribe) {
                this.startListenToAsr();
            }
            this.replayInProgress = false;
            this.showSpinner = false;
        })

        // this.startListenToAsr();
        // this.startHeyGen();
    }

    ngAfterViewInit(): void {
        this.setUpPlayerListeners();
        this.setUpTeacherSize();
        this.setUpHeyGenVideoByText(this.currentSlide.text);
    }

    startListenToAsr() {
        if (!this.recognitionSubscribe) {
            this.recognitionSubscribe = this.speechRecognitionService.onResults.subscribe(this.onRecognitionResults);
            this.speechRecognitionService.startListening();
        }
    }

    onRecognitionResults = (results: any) => {
        console.log("onRecognitionResults results", results)
        const recognitionText = results.text;
        if (results.isFinal) {
            console.log('onRecognitionResults final', recognitionText)
            this.messages.push(
                new ChatMessage({type: 'user', message: recognitionText}),
            )
            this.sendUserReplay(recognitionText);
            this.scrollToBottom2();
            this.showSpinner = false;
        }
    }

    stopListenToAsr() {
        if (this.recognitionSubscribe) {
            this.speechRecognitionService.stopListening();
            this.recognitionSubscribe.unsubscribe(this.onRecognitionResults);
            this.recognitionSubscribe = null;
        }
    }

    sendUserReplay(student_response: string) {
        this.replayInProgress = true;
        this.showSpinner = true;
        this.stopListenToAsr();
        const data = {
            "source": "video-ielts",
            'stopAudio': true,
            'background':true,
            "student_response":student_response
        }
        this.lessonService.Broadcast("PresentationReplayRequest", data)
    }

    setUpPlayerListeners() {
        if (this.video) {
            const data: any = {"source": "video_player"}
            let lastTime = 0;
            let lastState = PlayerState.UNSTARTED;
            this.video.nativeElement.onseeked = (e: any) => {
                console.log('onseeked')
            }
            this.video.nativeElement.onpause = (e: any) => {
                if (lastState === PlayerState.PAUSED) {
                    console.log('onpause')
                }
                // if (lastTime === this.video.nativeElement.currentTime) {
                //     if (lastState === PlayerState.PLAYING) {
                //         console.log('onpause')
                //     }
                //     lastState = PlayerState.PAUSED;
                // }
                // this.startListenToAsr();
                // data['video_event'] = "paused";
                // data['noToggle'] = true;
                // this.lessonService.Broadcast("endDoNotDisturb", data)
                // this.lessonService.Broadcast("slideEventRequest", data)
            }
            this.video.nativeElement.onplay = (e: any) => {
                console.log('onplay')
                if (lastState === PlayerState.PAUSED || lastState === PlayerState.UNSTARTED) {
                    console.log('onplay')
                }
                // console.log('this.video.nativeElement.currentTime', this.video.nativeElement.currentTime)
                // console.log('lastTime', lastTime)
                // if (lastState === PlayerState.PAUSED) {
                //     console.log('onplay')
                // }
                lastState = PlayerState.PLAYING;
                // this.stopListenToAsr();
                // data['video_event'] = "playing";
                // this.lessonService.Broadcast("DoNotDisturb", data)
            }
            this.video.nativeElement.ontimeupdate = (e: any) => {
                // if (lastState === PlayerState.PLAYING) {
                //     lastTime = this.video.nativeElement.currentTime;
                //     console.log('ontimeupdate', this.video.nativeElement.currentTime)
                // }
            }
            this.video.nativeElement.onended = (e: any) => {
                console.log('onended')
                // this.startListenToAsr();
                // data['video_event'] = "ended";
                // data['noToggle'] = true;
                // this.lessonService.Broadcast("endDoNotDisturb", data)
                // this.lessonService.Broadcast("slideEventRequest", data)
            }
            // if (e.data == PlayerState.ENDED) {
            //     this.currentState = PlayerState.ENDED;
            //     console.log('video ended')
            //     data['video_event'] = "ended";
            //     data['noToggle'] = true;
            //     this.lessonService.Broadcast("endDoNotDisturb", data)
            //     this.lessonService.Broadcast("slideEventRequest", data)
            // }
            // if (e.data == PlayerState.PAUSED) {
            //     this.currentState = PlayerState.PAUSED;
            //     console.log('video paused')
            //     data['video_event'] = "paused";
            //     data['noToggle'] = true;
            //     this.lessonService.Broadcast("endDoNotDisturb", data)
            //     this.lessonService.Broadcast("slideEventRequest", data)
            // }
            // if (e.data == PlayerState.PLAYING) {
            //     this.currentState = PlayerState.PLAYING;
            //     console.log('video playing')
            //     data['video_event'] = "playing";
            //     this.lessonService.Broadcast("DoNotDisturb", data)
            // }
        }
    }

    setUpTeacherSize() {
        const parent = this.teacher.nativeElement.parentElement;
        const parentHeight = parent.clientHeight;
        const parentWidth = parent.clientWidth;
        if (parentHeight > parentWidth) {
            this.teacher.nativeElement.style.height = parentWidth + 'px';
            this.teacher.nativeElement.style.width = parentWidth + 'px'
        } else {
            this.teacher.nativeElement.style.height = parentHeight + 'px';
            this.teacher.nativeElement.style.width = parentHeight + 'px'
        }
        // if (this.teacher.nativeElement.clientHeight > this.teacher.nativeElement.clientWidth) {
        //     this.teacher.nativeElement.style.height = this.teacher.nativeElement.clientWidth + 'px';
        //     this.teacher.nativeElement.style.width = null;
        // } else {
        //     this.teacher.nativeElement.style.width = this.teacher.nativeElement.clientHeight + 'px';
        //     this.teacher.nativeElement.style.height = null;
        // }
    }

    onPlayerReady(e: any) {
        this.loading_player = false;
        console.log('onPlayerReady e', e)
    }

    onPlayerStateChange(e: OnStateChangeEvent) {
        console.log('YouTube event: ', e)
        console.log('YouTube event target - current time : ', e.target.getCurrentTime())
        this.currentState = e.data;
        clearTimeout(this.currentStateTimeout);
        this.currentStateTimeout = setTimeout(() => {
            const data: any = {"source": "video_player"}
            if (e.data == PlayerState.ENDED) {
                this.currentState = PlayerState.ENDED;
                console.log('video ended')
                data['video_event'] = "ended";
                data['noToggle'] = true;
                this.lessonService.Broadcast("endDoNotDisturb", data)
                this.lessonService.Broadcast("slideEventRequest", data)
            }
            if (e.data == PlayerState.PAUSED) {
                this.currentState = PlayerState.PAUSED;
                console.log('video paused')
                data['video_event'] = "paused";
                data['noToggle'] = true;
                this.lessonService.Broadcast("endDoNotDisturb", data)
                this.lessonService.Broadcast("slideEventRequest", data)
            }
            if (e.data == PlayerState.PLAYING) {
                this.currentState = PlayerState.PLAYING;
                console.log('video playing')
                data['video_event'] = "playing";
                this.lessonService.Broadcast("DoNotDisturb", data)
            }
        }, this.stateTimeout)
    }

    scrollToBottom2(animate=false, timeout=0){
        if (this.scroller) {
            setTimeout(() => {
                const element = this.scroller.nativeElement;
                element.scrollTop = element.scrollHeight
            }, timeout)
        }
    }

    sendMessage() {
        if (this.replayInProgress) {
            return;
        }
        this.messages.push(
            new ChatMessage({type: 'user', message: this.message}),
        )
        this.sendUserReplay(this.message);
        this.message = "";
        this.scrollToBottom2();
    }

    translate(index: number) {
        if (!this.messages[index].translatedMessage) {
            this.translateGoogle(this.messages[index]).then((translated_text: string) => {
                this.messages[index].translatedMessage = translated_text;
                this.messages[index].showTranslated = true;
            }).catch((e) => {
                console.log('translateGoogle e', e)
            })
        } else {
            this.messages[index].showTranslated = !this.messages[index].showTranslated;
        }
    }

    translateGoogle(currentMessage: ChatMessage): Promise<string> {
        return new Promise((resolve, reject) => {
            var sourceLang = 'en';
            var targetLang = 'he';

            var url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl="+ sourceLang + "&tl=" + targetLang + "&dt=t&q=" + encodeURI(currentMessage.message);

            $.getJSON(url, (data: any) => {
                let translated_text = '';
                try {
                    translated_text = data[0].map((o: any) => o[0]).join('')
                    resolve(translated_text);
                } catch (e) {
                    reject(e)
                }
            });
        })
    }

    @HostListener('window:resize')
    onWindowResize() {
        this.setUpTeacherSize();
    }

    onDragStarted(e: Event) {
        const pos = this.helperService.getPointerPos(e, false);
        this.drag.mousedown = true;
        this.drag.startPos = pos;
        this.dragStarted = true;
        const el = this.document.getElementById('wrapper');
        if (el) {
            el.classList.add('disable-pointer-events');
        }
    }

    @HostListener('document:mousemove', ['$event'])
    @HostListener('document:touchmove', ['$event'])
    onDragMove(e: Event) {
        if (this.dragStarted) {
            e.preventDefault();
            e.stopPropagation();
            const pos = this.helperService.getPointerPos(e, false);
            console.log('pos', pos)
            const moveX = pos.x - this.drag.startPos.x;
            console.log('moveX', moveX)
            console.log('this.drag.width', this.drag.width)
            this.drag.width -= moveX;
            if(this.drag.width > this.drag.maxWidth) {
                this.drag.width = this.drag.maxWidth
            } else if(this.drag.width < this.drag.minWidth) {
                this.drag.width = this.drag.minWidth
            } else {
                this.onWindowResize();
            }
            this.drag.startPos = pos;
        }
    }

    @HostListener('document:mouseup', ['$event'])
    @HostListener('document:touchend', ['$event'])
    onDragEnded(e: Event) {
        this.dragStarted = false;
        this.drag.mousedown = false;
        this.drag.startPos = null;
        const el = this.document.getElementById('wrapper');
        if (el) {
            el.classList.remove('disable-pointer-events');
        }
    }

    setUpHeyGenDefaultAvatar() {
        if (this.heygenMediaElement) {
            this.heygenMediaElement.nativeElement.srcObject = undefined;
            this.heygenMediaElement.nativeElement.src = this.imageSrc + "assets/d-id/example_video.mp4";
            this.heygenMediaElement.nativeElement.loop = true;
            // this.heygenMediaElement.nativeElement.mute = true;
        }
    }

    setUpHeyGenVideoByText(text:string){
        if (this.heygenMediaElement) {
            if(text === 'some text') {
                this.heygenMediaElement.nativeElement.srcObject = undefined;
                this.heygenMediaElement.nativeElement.src = this.imageSrc + "assets/d-id/some-video.mp4";
                this.heygenMediaElement.nativeElement.play();
            } else {
                this.setUpHeyGenDefaultAvatar();
            }
        }
    }

    async startHeyGen() {
        const avatar = "example";
        const voice = "example";

        // call the new interface to get the server's offer SDP and ICE server to create a new RTCPeerConnection
        this.sessionInfo = await this.newSession("high", avatar, voice);
        const { sdp: serverSdp, ice_servers: iceServers } = this.sessionInfo;
        this.peerConnection = new RTCPeerConnection({ iceServers: [] });
        let formattedIceServers = iceServers.map((server: any) => ({ urls: server }));
        this.peerConnection.setConfiguration({ iceServers: formattedIceServers });

        // When ICE candidate is available, send to the server
        this.peerConnection.onicecandidate = ({ candidate }: any) => {
            console.log("Received ICE candidate:", candidate);
            if (candidate) {
                this.handleICE(this.sessionInfo.session_id, candidate.toJSON());
            }
        };

        // When ICE connection state changes, display the new state
        this.peerConnection.oniceconnectionstatechange = (event: any) => {

        };

        // When audio and video streams are received, display them in the video element
        const mediaElement: any = document.querySelector("#mediaElement");
        this.peerConnection.ontrack = (event: any) => {
            console.log("Received the track");
            if (event.track.kind === "audio" || event.track.kind === "video") {
                mediaElement.srcObject = event.streams[0];
            }
        };

        // Set server's SDP as remote description
        const remoteDescription = new RTCSessionDescription(serverSdp);
        await this.peerConnection.setRemoteDescription(remoteDescription);
    }

    async newSession(quality: string, avatar_name: string, voice_name: string) {
        const response = await fetch(`${SERVER_URL}/v1/realtime.new`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Api-Key": apiKey,
            },
            body: JSON.stringify({ quality, avatar_name, voice_name }),
        });
        if (response.status === 200) {
            const data = await response.json();
            console.log(data.data);
            return data.data;
        } else {
            console.error("Server error");
            throw new Error("Server error");
        }
    }

    async handleICE(session_id: any, candidate: any) {
        const response = await fetch(`${SERVER_URL}/v1/realtime.ice`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Api-Key": apiKey,
            },
            body: JSON.stringify({ session_id, candidate }),
        });
        if (response.status === 200) {
            const data = await response.json();
            return data;
        } else {
            console.error("Server error");
            throw new Error("Server error");
        }
    }

    async startAndDisplaySession() {
        if (!this.sessionInfo) {
            console.log("Please create a connection first")
            return;
        }

        console.log("Starting session... please wait")

        // Create and set local SDP description
        const localDescription = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(localDescription);

        // Start session
        await this.startSession(this.sessionInfo.session_id, localDescription);
        console.log("Session started successfully")
    }

    async startSession(session_id: any, sdp: any) {
        const response = await fetch(`${SERVER_URL}/v1/realtime.start`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Api-Key": apiKey,
            },
            body: JSON.stringify({ session_id, sdp }),
        });
        if (response.status === 200) {
            const data = await response.json();
            return data.data;
        } else {
            console.error("Server Error. Please ask the staff if the service has been turned on");
            throw new Error("Server error");
        }
    }

    async createHeyGenNewSession(apiKey: string) {
        const response: any = await fetch(`${'https://api.heygen.com'}/v1/realtime.new`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Api-Key": apiKey,
            },
            body: JSON.stringify({ quality: "high" }),
        });

        const message = response.message;
        const data = response.data;
        console.log('message', message)
        console.log('data', data)
        this.heyGenStartNewSession(apiKey, data)

    }
    async heyGenStartNewSession(apiKey: string, data: any) {
        const response: any = await fetch(`${'https://api.heygen.com'}/v1/realtime.start`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Api-Key": apiKey,
            },
            body: JSON.stringify({
                session_id: data.session_id,
                sdp: data.sdp
            }),
        });
        //
        // const message = response.message;
        // const data = response.data;
        // console.log('message', message)
        // console.log('data', data)

    }

    getOrcreateConversation() {
        let localStream: any = null;
        //==============================
        // 1/ CREATE USER AGENT
        //==============================
        const api_key = "ODU1NDg1MThlOGEwNDMxMGI1OGIzOTc1NjUwNzUzNGUtMTcwMTM2NDI2NQ=="
        var ua = new apiRTC.UserAgent({
            uri: `apzkey:${api_key}`
        });
        //==============================
        // 2/ REGISTER
        //==============================
        ua.register().then((session: any) => {
            //==============================
            // 3/ CREATE CONVERSATION
            //==============================
            const conversation = session.getConversation('');
            //==========================================================
            // 4/ ADD EVENT LISTENER : WHEN NEW STREAM IS AVAILABLE IN CONVERSATION
            //==========================================================
            conversation.on('streamListChanged', (streamInfo: any) => {
                console.log("streamListChanged :", streamInfo);
                if (streamInfo.listEventType === 'added') {
                    if (streamInfo.isRemote === true) {
                        conversation.subscribeToMedia(streamInfo.streamId)
                            .then((stream: any) => {
                                console.log('subscribeToMedia success');
                            }).catch((err: any) => {
                            console.error('subscribeToMedia error', err);
                        });
                    }
                }
            });
            //=====================================================
            // 4 BIS/ ADD EVENT LISTENER : WHEN STREAM IS ADDED/REMOVED TO/FROM THE CONVERSATION
            //=====================================================
            conversation.on('streamAdded', (stream: any) => {
                stream.addInDiv('remote-container', 'remote-media-' + stream.streamId, {}, false);
            }).on('streamRemoved', (stream: any) => {
                stream.removeFromDiv('remote-container', 'remote-media-' + stream.streamId);
            });
            //==============================
            // 5/ CREATE LOCAL STREAM
            //==============================
            ua.createStream({
                constraints: {
                    audio: true,
                    video: true
                }
            })
                .then((stream: any) => {
                    console.log('createStream :', stream);
                    // Save local stream
                    localStream = stream;
                    stream.removeFromDiv('local-container', 'local-media');
                    stream.addInDiv('local-container', 'local-media', {}, true);
                    //==============================
                    // 6/ JOIN CONVERSATION
                    //==============================
                    conversation.join()
                        .then((response: any) => {
                            //==============================
                            // 7/ PUBLISH LOCAL STREAM
                            //==============================
                            conversation.publish(localStream);
                        }).catch((err: any) => {
                        console.error('Conversation join error', err);
                    });
                }).catch((err: any) => {
                console.error('create stream error', err);
            });
        });
    }

    override ngOnDestroy(): void {
        this.stopListenToAsr();
        super.ngOnDestroy();
    }
}


// constructor(private sanitizer: DomSanitizer) {
//   // Paste the YouTube iframe code you copied here
//   const embedCode = `<iframe width="560" height="315" src="https://www.youtube.com/embed/VIDEO_ID" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;

//   // Sanitize and set the HTML
//   this.embeddedVideo = this.sanitizer.bypassSecurityTrustHtml(embedCode);

