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

declare let $: any;
declare let apiRTC: any;

// TODO remove key
const apiKey = "";
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

    recognitionSubscribe: any;

    replayInProgress = false;
    videoIsPlaying = false;

    showSpinner = false;

    drag: any = {
        mousedown: false,
        startPos: null,
        width: 300,
        maxWidth: 500,
        minWidth: 200
    };

    dragStarted = false;

    // HEYGEN
    sessionInfo: any = null;
    peerConnection: any = null;
    taskInterval: any = null;

    videoState = PlayerState.UNSTARTED;

    unsDemo = true;

    constructor(
        protected override config: Config,
        private sanitizer: DomSanitizer,
        protected override lessonService: LessonService,
        private helperService: HelperService,
        @Inject(DOCUMENT) document?: any
    ) {
        super(config, lessonService);
        this.document = document;
        this.embeddedVideo = "";
        if (environment.is_mock) {
            this.messages = [
                new ChatMessage({type: 'computer', message: 'Hi'}),
                new ChatMessage({type: 'user', message: 'Hello'})
            ];
        }
    }
    override ngOnInit(): void {
        super.ngOnInit();
        this.showPanel = true;
        setTimeout(() => {
            this.scrollToBottom2();
        });
        // this.createVideo();

        this.listenToSlideEvents();
    }

    ngAfterViewInit(): void {
        this.setUpPlayerListeners();
        this.setUpHeygenListeners();
        this.setUpTeacherSize();
        this.messages.push(
            new ChatMessage({type: 'computer', message: "Let's see a short video in order to explore the ielts reading section. You can start it by pressing the play button. Feel free to pause the video and to ask me any question."})
        );
        if (this.unsDemo) {
            this.setUpHeyGenVideoByText("Let's see a short video in order to explore the ielts reading section. You can start it by pressing the play button. Feel free to pause the video and to ask me any question.");
        } else {
            this.startHeyGen();
        }
    }

    listenToSlideEvents() {
        this.lessonService.ListenFor("slideEventReply").subscribe((resp:any) => {
            if (resp.type == "additional_instructions") {
                const teacher_text = resp.data.teacher_text;
                if (teacher_text) {
                    this.messages.push(
                        new ChatMessage({type: 'computer', message: teacher_text})
                    );
                    this.scrollToBottom2();
                    if (this.unsDemo) {
                        this.setUpHeyGenVideoByText(teacher_text);
                    } else {
                        this.startSessionTask(this.sessionInfo.session_id, teacher_text);
                    }
                }
            }
            if (resp.data.source == "video_ielts_mark_as_complete_button") {
                this.currentSlide.video_completed = true;
            }
        });
        this.lessonService.ListenFor("student_reply_response").subscribe((resp:any) => {
            try {
                console.log('student_reply_response resp', resp);
                const resp_data = resp.data;
                if (resp_data && resp_data.text) {
                    this.messages.push(
                        new ChatMessage({type: 'computer', message: resp_data.text})
                    );
                    this.scrollToBottom2();
                    if (this.unsDemo) {
                        this.setUpHeyGenVideoByText(resp_data.text);
                    } else {
                        this.startSessionTask(this.sessionInfo.session_id, resp_data.text);
                    }
                }
                this.showSpinner = false;
            } catch (e) {}
        });
        this.lessonService.ListenFor("recognitionText").subscribe((recognitionText:string) => {
            this.messages.push(
                new ChatMessage({type: 'user', message: recognitionText})
            );
            this.sendUserReplay(recognitionText);
            this.scrollToBottom2();
        });
        this.lessonService.ListenFor("slideEventReplyError").subscribe((resp:any) => {
            if (this.showSpinner) {
                this.showSpinner = false;
            }
        });
        this.lessonService.ListenFor("blockAllSlideEvents").subscribe((resp:any) => {
            if (this.showSpinner) {
                this.showSpinner = false;
            }
        });
        this.lessonService.ListenFor("student_reply_error").subscribe((resp:any) => {

        });
    }

    clearSlideEvents() {
        this.lessonService.ClearEvent("slideEventReply");
        this.lessonService.ClearEvent("student_reply_response");
        this.lessonService.ClearEvent("recognitionText");
        this.lessonService.ClearEvent("slideEventReplyError");
        this.lessonService.ClearEvent("blockAllSlideEvents");
        this.lessonService.ClearEvent("student_reply_error");
    }

    sendUserReplay(student_response: string) {
        this.replayInProgress = true;
        this.showSpinner = true;
        this.lessonService.Broadcast('stopListenToAsr');
        const data = {
            "source": "video-ielts",
            'stopAudio': true,
            'background':true,
            "student_response":student_response
        };
        this.lessonService.Broadcast("PresentationReplayRequest", data);
    }

    playVideo() {
        if (this.video) {
            const data: any = {"source": "video_player"};
            const playPromise = this.video.nativeElement.play();
            if (playPromise !== undefined) {
                playPromise.catch((error: any) => {
                    // Automatic playback failed.
                });
            }
            this.videoState = PlayerState.PLAYING;
            this.lessonService.Broadcast('stopListenToAsr');
            data['video_event'] = "playing";
            this.heygenMediaElement.nativeElement.pause();
            // this.heygenMediaElement.nativeElement.trigger('ended');
            this.lessonService.Broadcast("DoNotDisturb", data);
        }
    }

    setUpPlayerListeners() {
        if (this.video) {
            const data: any = {"source": "video_player"};
            const lastTime = 0;
            const lastState = PlayerState.UNSTARTED;
            this.video.nativeElement.onclick = (e: any) => {
                this.video.nativeElement.pause();
                this.videoState = PlayerState.PAUSED;
                this.lessonService.Broadcast('startListenToAsr');
                data['video_event'] = "paused";
                data['noToggle'] = true;
                this.lessonService.Broadcast("endDoNotDisturb", data);
                this.lessonService.Broadcast("slideEventRequest", data);
            };
            this.video.nativeElement.onended = (e: any) => {
                this.videoState = PlayerState.PAUSED;
                this.lessonService.Broadcast('startListenToAsr');
                data['video_event'] = "ended";
                data['noToggle'] = true;
                this.lessonService.Broadcast("endDoNotDisturb", data);
                this.lessonService.Broadcast("slideEventRequest", data);
            };
            // this.video.nativeElement.onseeked = (e: any) => {
            //     console.log('onseeked')
            // }
            // this.video.nativeElement.onpause = (e: any) => {
            //     if (lastState === PlayerState.PAUSED) {
            //         console.log('onpause')
            //     }
            //     // if (lastTime === this.video.nativeElement.currentTime) {
            //     //     if (lastState === PlayerState.PLAYING) {
            //     //         console.log('onpause')
            //     //     }
            //     //     lastState = PlayerState.PAUSED;
            //     // }
            //     // this.startListenToAsr();
            //     // data['video_event'] = "paused";
            //     // data['noToggle'] = true;
            //     // this.lessonService.Broadcast("endDoNotDisturb", data)
            //     // this.lessonService.Broadcast("slideEventRequest", data)
            // }
            // this.video.nativeElement.onplay = (e: any) => {
            //     console.log('onplay')
            //     if (lastState === PlayerState.PAUSED || lastState === PlayerState.UNSTARTED) {
            //         console.log('onplay')
            //     }
            //     // console.log('this.video.nativeElement.currentTime', this.video.nativeElement.currentTime)
            //     // console.log('lastTime', lastTime)
            //     // if (lastState === PlayerState.PAUSED) {
            //     //     console.log('onplay')
            //     // }
            //     lastState = PlayerState.PLAYING;
            //     // this.stopListenToAsr();
            //     // data['video_event'] = "playing";
            //     // this.lessonService.Broadcast("DoNotDisturb", data)
            // }
            // this.video.nativeElement.ontimeupdate = (e: any) => {
            //     // if (lastState === PlayerState.PLAYING) {
            //     //     lastTime = this.video.nativeElement.currentTime;
            //     //     console.log('ontimeupdate', this.video.nativeElement.currentTime)
            //     // }
            // }
            // this.video.nativeElement.onended = (e: any) => {
            //     console.log('onended')
            //     // this.startListenToAsr();
            //     // data['video_event'] = "ended";
            //     // data['noToggle'] = true;
            //     // this.lessonService.Broadcast("endDoNotDisturb", data)
            //     // this.lessonService.Broadcast("slideEventRequest", data)
            // }
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

    setUpHeygenListeners() {
        if (this.heygenMediaElement) {
            this.heygenMediaElement.nativeElement.onended = (event: any) => {
                if (this.heygenMediaElement.nativeElement.loop) {
                    return;
                }
                this.lessonService.Broadcast('startListenToAsr');
                this.videoIsPlaying = false;
                this.setUpHeyGenDefaultAvatar();
                console.log(
                    event, "Video stopped either because it has finished playing or no further data is available."
                );
            };
        }
    }

    setUpTeacherSize() {
        const parent = this.teacher.nativeElement.parentElement;
        const parentHeight = parent.clientHeight;
        const parentWidth = parent.clientWidth;
        if (parentHeight > parentWidth) {
            this.teacher.nativeElement.style.height = parentWidth + 'px';
            this.teacher.nativeElement.style.width = parentWidth + 'px';
        } else {
            this.teacher.nativeElement.style.height = parentHeight + 'px';
            this.teacher.nativeElement.style.width = parentHeight + 'px';
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
        console.log('onPlayerReady e', e);
    }

    onPlayerStateChange(e: OnStateChangeEvent) {
        console.log('YouTube event: ', e);
        console.log('YouTube event target - current time : ', e.target.getCurrentTime());
        this.currentState = e.data;
        clearTimeout(this.currentStateTimeout);
        this.currentStateTimeout = setTimeout(() => {
            const data: any = {"source": "video_player"};
            if (e.data == PlayerState.ENDED) {
                this.currentState = PlayerState.ENDED;
                console.log('video ended');
                data['video_event'] = "ended";
                data['noToggle'] = true;
                this.lessonService.Broadcast("endDoNotDisturb", data);
                this.lessonService.Broadcast("slideEventRequest", data);
            }
            if (e.data == PlayerState.PAUSED) {
                this.currentState = PlayerState.PAUSED;
                console.log('video paused');
                data['video_event'] = "paused";
                data['noToggle'] = true;
                this.lessonService.Broadcast("endDoNotDisturb", data);
                this.lessonService.Broadcast("slideEventRequest", data);
            }
            if (e.data == PlayerState.PLAYING) {
                this.currentState = PlayerState.PLAYING;
                console.log('video playing');
                data['video_event'] = "playing";
                this.lessonService.Broadcast("DoNotDisturb", data);
            }
        }, this.stateTimeout);
    }

    scrollToBottom2(animate = false, timeout = 0) {
        if (this.scroller) {
            setTimeout(() => {
                const element = this.scroller.nativeElement;
                element.scrollTop = element.scrollHeight;
            }, timeout);
        }
    }

    sendMessage() {
        if (this.replayInProgress || this.videoIsPlaying) {
            return;
        }
        this.messages.push(
            new ChatMessage({type: 'user', message: this.message})
        );
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
                console.log('translateGoogle e', e);
            });
        } else {
            this.messages[index].showTranslated = !this.messages[index].showTranslated;
        }
    }

    translateGoogle(currentMessage: ChatMessage): Promise<string> {
        return new Promise((resolve, reject) => {
            const sourceLang = 'en';
            const targetLang = 'he';

            const url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=" + sourceLang + "&tl=" + targetLang + "&dt=t&q=" + encodeURI(currentMessage.message);

            $.getJSON(url, (data: any) => {
                let translated_text = '';
                try {
                    translated_text = data[0].map((o: any) => o[0]).join('');
                    resolve(translated_text);
                } catch (e) {
                    reject(e);
                }
            });
        });
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
            console.log('pos', pos);
            const moveX = pos.x - this.drag.startPos.x;
            console.log('moveX', moveX);
            console.log('this.drag.width', this.drag.width);
            this.drag.width -= moveX;
            if(this.drag.width > this.drag.maxWidth) {
                this.drag.width = this.drag.maxWidth;
            } else if(this.drag.width < this.drag.minWidth) {
                this.drag.width = this.drag.minWidth;
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
            this.heygenMediaElement.nativeElement.src = this.imageSrc + "assets/d-id/silent_2.mp4";
            this.heygenMediaElement.nativeElement.loop = true;
            // this.heygenMediaElement.nativeElement.mute = true;
        }
    }

    setUpHeyGenVideoByText(text:string) {
        console.log('setUpHeyGenVideoByText text', text);
        if (this.heygenMediaElement) {
            console.log('setUpHeyGenVideoByText text', text);
            this.heygenMediaElement.nativeElement.srcObject = undefined;
            // "Gaia, what are the subjects of those articles?": "The reading articles encompasses a wide range of topics, reflecting the diversity found in college materials. This prepares you for various academic and professional scenarios. However, for practice, we'll concentrate on areas of your interest to maintain engagement and interest.",
            // "Thanks. Can I skip this video and start practicing": "We don't really recommend skipping the video lessons, but if you really want to, just head over to the dashboard and hit the 'start practice reading' button."
            // "I see you paused the video. Do you have any question?"
            if(text === "The reading articles encompasses a wide range of topics, reflecting the diversity found in college materials. This prepares you for various academic and professional scenarios. However, for practice, we'll concentrate on areas of your interest to maintain engagement and interest.") {
                this.heygenMediaElement.nativeElement.src = this.imageSrc + "assets/d-id/responses_3.mp4";
                this.heygenMediaElement.nativeElement.loop = false;
                const playPromise = this.heygenMediaElement.nativeElement.play();
                if (playPromise !== undefined) {
                    playPromise.catch((error: any) => {
                        // Automatic playback failed.
                    });
                }
                this.videoIsPlaying = true;
            } else if (text === "We don't really recommend skipping the video lessons, but if you really want to, just head over to the dashboard and hit the 'start practice reading' button.") {
                this.heygenMediaElement.nativeElement.src = this.imageSrc + "assets/d-id/responses_4.mp4";
                this.heygenMediaElement.nativeElement.loop = false;
                const playPromise = this.heygenMediaElement.nativeElement.play();
                if (playPromise !== undefined) {
                    playPromise.catch((error: any) => {
                        // Automatic playback failed.
                    });
                }
                this.videoIsPlaying = true;
            } else if (text === "I see you paused the video. Do you have any question?") {
                this.heygenMediaElement.nativeElement.src = this.imageSrc + "assets/d-id/responses_1.mp4";
                this.heygenMediaElement.nativeElement.loop = false;
                const playPromise = this.heygenMediaElement.nativeElement.play();
                if (playPromise !== undefined) {
                    playPromise.catch((error: any) => {
                        // Automatic playback failed.
                    });
                }
                this.videoIsPlaying = true;
            } else if (text === "Let's see a short video in order to explore the ielts reading section. You can start it by pressing the play button. Feel free to pause the video and to ask me any question.") {
                this.heygenMediaElement.nativeElement.src = this.imageSrc + "assets/d-id/responses_2.mp4";
                this.heygenMediaElement.nativeElement.loop = false;
                const playPromise = this.heygenMediaElement.nativeElement.play();
                if (playPromise !== undefined) {
                    playPromise.catch((error: any) => {
                        // Automatic playback failed.
                    });
                }
                this.videoIsPlaying = true;
            }
            else {
                this.lessonService.Broadcast('startListenToAsr');
                this.setUpHeyGenDefaultAvatar();
            }
        }
    }

    async startHeyGen() {
        const avatar = "default";
        const voice = 'en-US-JennyNeural';
        const session_id = this.getSessionId();
        if (session_id) {
            try {
                this.deleteSessionId();
                await this.stopSession(session_id);
            } catch (e) {}
        }
        // call the new interface to get the server's offer SDP and ICE server to create a new RTCPeerConnection
        this.sessionInfo = await this.newSession("high", avatar, voice);
        const { sdp: serverSdp, ice_servers: iceServers } = this.sessionInfo;
        this.peerConnection = new RTCPeerConnection({ iceServers: [] });
        const formattedIceServers = iceServers.map((server: any) => ({ urls: server }));
        this.peerConnection.setConfiguration({ iceServers: formattedIceServers });

        // When ICE candidate is available, send to the server
        this.peerConnection.onicecandidate = ({ candidate }: any) => {
            // console.log("Received ICE candidate:", candidate);
            if (candidate) {
                // this.handleICE(this.sessionInfo.session_id, candidate.toJSON());
            }
        };

        // When ICE connection state changes, display the new state
        this.peerConnection.oniceconnectionstatechange = (event: any) => {

        };

        // When audio and video streams are received, display them in the video element
        const mediaElement: any = document.querySelector("#mediaElement");
        this.peerConnection.ontrack = (event: any) => {
            console.log("ontrack Received the track", event);
            if (event.track.kind === "audio" || event.track.kind === "video") {}
            if (event.track.kind === "video") {
                mediaElement.srcObject = event.streams[0];
            }
        };

        // Set server's SDP as remote description
        const remoteDescription = new RTCSessionDescription(serverSdp);
        await this.peerConnection.setRemoteDescription(remoteDescription);

        this.startAndDisplaySession();
    }

    async newSession(quality: string, avatar_name: string, voice_name: string) {
        const response = await fetch(`${SERVER_URL}/v1/realtime.new`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Api-Key": apiKey
            },
            body: JSON.stringify({
                quality,
                avatar_name,
                voice_name
            })
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
                "X-Api-Key": apiKey
            },
            body: JSON.stringify({ session_id, candidate })
        });
        if (response.status === 200) {
            const data = await response.json();
            return data;
        } else {
            console.error("Server error");
            throw new Error("Server error");
        }
    }

    async stopSession(session_id: any) {
        if (!session_id) {
            return;
        }
        const response = await fetch(`${SERVER_URL}/v1/realtime.stop`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Api-Key": apiKey
            },
            body: JSON.stringify({ session_id })
        });
        if (response.status === 200) {
            const data = await response.json();
            return data.data;
        } else {
            console.error("Server Error. Please ask the staff if the service has been turned on");
            throw new Error("Server error");
        }
    }
    async startSessionTask(session_id: any, text: string) {
        const response = await fetch(`${SERVER_URL}/v1/realtime.task`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Api-Key": apiKey
            },
            body: JSON.stringify({ session_id, text, task_type: 'test' })
        });
        if (response.status === 200) {
            const data = await response.json();
            this.taskDurationCounter(data.data.duration_ms);
            return data.data;
        } else {
            console.error("Server Error. Please ask the staff if the service has been turned on");
            throw new Error("Server error");
        }
    }

    async taskDurationCounter(duration_ms: number) {
        let d_seconds = duration_ms / 1000;
        this.taskInterval = setInterval(() => {
            if (d_seconds <= 0) {
                clearInterval(this.taskInterval);
                this.lessonService.Broadcast('startListenToAsr');
            }
            d_seconds--;
        }, 1000);
    }

    async startAndDisplaySession() {
        if (!this.sessionInfo) {
            console.log("Please create a connection first");
            return;
        }

        console.log("Starting session... please wait");

        // Create and set local SDP description
        const localDescription = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(localDescription);

        // Start session
        await this.startSession(this.sessionInfo.session_id, localDescription);
        console.log("Session started successfully");
        const data = await this.makeSureSessionIsConnected();
        if (data.state === 'connected') {
            this.startSessionTask(this.sessionInfo.session_id, "Let's see a short video in order to explore the ielts reading section. You can start it by pressing the play button. Feel free to pause the video and to ask me any question.");
        }
        // setTimeout(() => {
        //     this.startSessionTask(this.sessionInfo.session_id, "Let's see a short video in order to explore the ielts reading section. You can start it by pressing the play button. Feel free to pause the video and to ask me any question.");
        // }, 10000)
    }

    async startSession(session_id: any, sdp: any) {
        const response = await fetch(`${SERVER_URL}/v1/realtime.start`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Api-Key": apiKey
            },
            body: JSON.stringify({ session_id, sdp })
        });
        if (response.status === 200) {
            const data = await response.json();
            this.setSessionId();
            return data.data;
        } else {
            console.error("Server Error. Please ask the staff if the service has been turned on");
            throw new Error("Server error");
        }
    }

    async checkSessionState(session_id: any) {
        const response = await fetch(`${SERVER_URL}/v1/realtime.state`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Api-Key": apiKey
            },
            body: JSON.stringify({ session_id })
        });
        if (response.status === 200) {
            const data = await response.json();
            return data.data;
        } else {
            console.error("Server Error. Please ask the staff if the service has been turned on");
            throw new Error("Server error");
        }
    }

    async makeSureSessionIsConnected(): Promise<any> {
        const targetValue = 'connected';
        let responseValue: any = {};
        let count = 0;
        const limitLoop = 5;
        while (responseValue.state !== targetValue) {
            try {
                // Make the HTTP request and wait for the response
                responseValue = await this.checkSessionState(this.sessionInfo.session_id);


                // Add any additional conditions if needed
                if (responseValue.state === targetValue || count > limitLoop) {
                    return responseValue; // Return the response value
                }

                // Simulate a delay before making the next request
                count++;
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                // Handle errors if needed
                console.error('Error makeSureSessionIsConnected HTTP request:', error);
                throw error; // Throw the error to signal failure
            }
        }
    }

    setSessionId() {
        console.log('setSessionId', this.sessionInfo.session_id);
        localStorage.setItem('h_s_id', this.sessionInfo.session_id);
    }

    getSessionId() {
        const session_id = localStorage.getItem('h_s_id');
        return session_id;
    }

    deleteSessionId() {
        localStorage.removeItem('h_s_id');
    }

    override ngOnDestroy(): void {
        this.lessonService.Broadcast('stopListenToAsr', true);
        if (this.sessionInfo) {
            this.deleteSessionId();
            this.stopSession(this.sessionInfo.session_id);
        }
        if (this.taskInterval) {
            clearInterval(this.taskInterval);
        }
        this.clearSlideEvents();
        super.ngOnDestroy();
    }

    // @HostListener("window:beforeunload", ["$event"])
    // async unloadHandler(event: Event) {
    //     await this.stopSession(this.sessionInfo.session_id);
    //     return false;
    // }

}


// constructor(private sanitizer: DomSanitizer) {
//   // Paste the YouTube iframe code you copied here
//   const embedCode = `<iframe width="560" height="315" src="https://www.youtube.com/embed/VIDEO_ID" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;

//   // Sanitize and set the HTML
//   this.embeddedVideo = this.sanitizer.bypassSecurityTrustHtml(embedCode);

