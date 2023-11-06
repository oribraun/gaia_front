import {LessonService} from "../../../services/lesson/lesson.service";
import {
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy, OnInit,
    Output,
    SimpleChanges,
    ViewChild
} from '@angular/core';
import {Presentation, PresentationSlide} from "../../../entities/presentation";
import {AnimationsService} from "../../../services/animations/animations.service";
import {Config} from "../../../config";
import {HelperService} from "../../../services/helper.service";
import {
    SocketSpeechRecognitionService
} from "../../../services/socket-speech-recognition/socket-speech-recognition.service";

@Component({
    selector: 'app-panel-board',
    templateUrl: './panel-board.component.html',
    styleUrls: ['./panel-board.component.less']
})
export class PanelBoardComponent implements OnInit, OnChanges, OnDestroy {

    @Input('presentation') presentation: Presentation = new Presentation();
    @Input('currentSlide') currentSlide: PresentationSlide = new PresentationSlide();
    @Input('currentSectionIndex') currentSectionIndex: number = -1;
    @Input('isMobile') isMobile: boolean = false;

    @ViewChild('videoElement', { static: false }) videoElement!: ElementRef;
    @ViewChild('canvasElement') canvasElement!: ElementRef;
    @ViewChild('user', { static: false }) userElement!: ElementRef;

    @Output('onResults') onResults: EventEmitter<any> = new EventEmitter<any>();
    @Output('onNextSlide') onNextSlide: EventEmitter<any> = new EventEmitter<any>();
    @Output('onPrevSlide') onPrevSlide: EventEmitter<any> = new EventEmitter<any>();

    mediaStream: any;

    subscribe: any;
    snapShotInterval: any = null
    imageSrc = ''
    pauseButtonText = "take a break"
    recorder: any;
    currentChunks: any[] = []

    currentIcon = 'assets/gifs/teacher_speaking.gif';
    icons: any = {
        'teacher_speaking': 'assets/gifs/teacher_speaking.gif',
        'teacher_listening': 'assets/gifs/teacher_listening.gif',
        'teacher_do_nothing': 'assets/gifs/teacher_do_nothing.gif',
        'slide_success': 'assets/gifs/slide_success.gif',
        'slide_failed': 'assets/gifs/slide_failed.gif',
        'teacher_sleep': 'assets/gifs/teacher_sleep.gif',
    }
    takeSnapshotEnabled = false;

    constructor(
        private config: Config,
        private animationsService: AnimationsService,
        private lessonService: LessonService,
    ) {
        this.listenToCircleAnimations();

        this.imageSrc = this.config.staticImagePath;
        if (this.takeSnapshotEnabled) {
            this.snapShotInterval = setInterval(() => {
                this.takeSnapshot()
            }, 15*1000)
        }
        this.startVideo().then((res) => {
            if (res) {
                this.setMediaStream();
                // this.setUpRecorder();
                // this.startRecording();
                // setTimeout(() => {
                //     this.stopRecording()
                // }, 5000)
            }
        })

        this.setIcon('teacher_speaking');
    }

    ngOnInit(): void {
        this.lessonService.ListenFor("resumeLesson").subscribe((obj: any) => {
            this.pauseButtonText = "take a break"
        })
        this.lessonService.ListenFor("panelIconChange").subscribe((obj: any) => {
            console.log('change gif - panelIconChange', obj)
            if (obj && obj.iconName) {
                this.setIcon(obj.iconName);
            }
            if (obj.iconName === "teacher_sleep") {
                if (this.subscribe) {
                    this.subscribe.unsubscribe();
                    this.subscribe = null;
                }
                this.removeAllCircles();
            }
            if (!this.subscribe) {
                this.listenToCircleAnimations();
            }

        })
    }

    listenToCircleAnimations() {
        this.subscribe = this.animationsService.onAddCircle.subscribe((obj) => {
            this.animationsService.addCircle(this.userElement.nativeElement, obj.unique_num)
        })
    }

    listenToSnapshotRequest() {
        this.lessonService.ListenFor("takeSnapshot").subscribe((obj: any) => {
            this.takeSnapshot()
        })
    }

    removeAllCircles() {
        this.animationsService.removeAllCircles(this.userElement.nativeElement)
    }

    startVideo() {
        return new Promise((resolve, reject) => {
            try {
                if (navigator.mediaDevices) {
                    const constraints = {
                        audio: {
                            echoCancellation: true,
                            noiseSuppression: true
                        },
                        video: true
                    };
                    navigator.mediaDevices.getUserMedia(constraints).then((mediaStream) => {
                        // Display the stream in the video element
                        this.mediaStream = mediaStream;
                        this.videoElement.nativeElement.srcObject = mediaStream;
                        resolve(true);
                    })
                } else {
                    console.error('Webcam access not supported');
                    resolve(false);
                }
            } catch (error) {
                console.error('Error accessing webcam:', error);
                resolve(false);
            }
        })
    }

    takeSnapshot() {
        if (this.takeSnapshotEnabled) {
            const video = this.videoElement.nativeElement;
            const canvas = this.canvasElement.nativeElement;
            const context = canvas.getContext('2d');

            // Adjust the canvas dimensions to match the video frame
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            // Draw the current video frame onto the canvas
            context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

            // Get the image data URL from the canvas
            const imageUrl = canvas.toDataURL('image/jpeg',0.5);

            // Now, you can use this imageUrl for display, storage, etc.
            this.lessonService.Broadcast("snapshotTaken", {image_url: imageUrl});
        }
    }

    setUpRecorder() {
        this.recorder = new MediaRecorder(this.mediaStream);

        const audioContext = new AudioContext();
        const mediaStreamSource = audioContext.createMediaStreamSource(this.mediaStream);
        // mediaStreamSource.connect(audioContext.destination);

        const analyser = audioContext.createAnalyser();
        mediaStreamSource.connect(analyser);
        analyser.fftSize = 2048;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const MIN_ENERGY_THRESHOLD = 50; // Adjust as needed
        const SILENCE_TIMEOUT = 2000; // Adjust as needed (in milliseconds)

        let isSpeaking = false;
        let lastNonZeroTime = 0;
        let audioBuffer: any = [];

        const processAudio = () => {
            analyser.getByteFrequencyData(dataArray);

            const energy = dataArray.reduce((acc, value) => acc + value, 0) / dataArray.length;

            if (energy > MIN_ENERGY_THRESHOLD) {
                console.log('audioBuffer',audioBuffer);
                if (!isSpeaking) {
                    isSpeaking = true;
                    lastNonZeroTime = Date.now();
                } else {
                    const currentTime = Date.now();
                    if (currentTime - lastNonZeroTime > SILENCE_TIMEOUT) {
                        // Speech detected after a period of silence
                        // Collect audio buffer or trigger an event
                    }
                    lastNonZeroTime = currentTime;
                }
                audioBuffer.push(dataArray.slice());
            } else {
                isSpeaking = false;
                if (audioBuffer.length > 0) {
                    const mergedBuffer = new Uint8Array(audioBuffer.length * dataArray.length);
                    for (let i = 0; i < audioBuffer.length; i++) {
                        mergedBuffer.set(audioBuffer[i], i * dataArray.length);
                    }
                    // Now 'mergedBuffer' contains the collected audio data during speech
                    console.log('Speech detected:', mergedBuffer);
                    audioBuffer = []; // Clear the buffer
                    const mergedArrayBuffer: ArrayBuffer = mergedBuffer.buffer;
                    audioContext.decodeAudioData(mergedArrayBuffer, decodedBuffer => {
                        const source = audioContext.createBufferSource();
                        source.buffer = decodedBuffer;
                        source.connect(audioContext.destination);
                        source.start();
                    }, error => {
                        console.error('Error decoding audio data:', error);
                    });
                }
            }

            requestAnimationFrame(processAudio);
        }

        processAudio();

        // this.recorder.ondataavailable = (event: any) => {
        //     if (event.data.size > 0) {
        //         this.currentChunks.push(event.data);
        //     }
        // };
        //
        // this.recorder.onstop = async () => {
        //     const blob = new Blob(this.currentChunks, { type: 'audio/wav' });
        //     const arrayBuffer: ArrayBuffer = await blob.arrayBuffer();
        //
        //     console.log('arrayBuffer', arrayBuffer)
        //     const audioBlob = new Blob([arrayBuffer], {type: 'audio/mpeg'});
        //     const currentAudio = new Audio();
        //     currentAudio.src = URL.createObjectURL(audioBlob);
        //     currentAudio.load();
        //     currentAudio.play();
        //     currentAudio.addEventListener('ended', async () => {
        //         // const decodedAudioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        //         const trimmedArrayBuffer = await this.trimSilentParts(arrayBuffer);
        //         this.playBuffer(trimmedArrayBuffer);
        //         // console.log('trimmedArrayBuffer', trimmedArrayBuffer)
        //         // const decodedAudioBuffer = await audioContext.decodeAudioData(trimmedArrayBuffer);
        //         // const audioBlob = new Blob([trimmedArrayBuffer], {type: 'audio/mpeg'});
        //         // const currentAudio = new Audio();
        //         // currentAudio.src = URL.createObjectURL(audioBlob);
        //         // currentAudio.load();
        //         // currentAudio.play();
        //     })
        //
        //     // const source = audioContext.createBufferSource();
        //     // source.buffer = trimmedAudioBuffer;
        //     // source.connect(audioContext.destination);
        //     // source.start();
        //
        //     // Send the ArrayBuffer to the server
        //     // const response = await this.http.post('/api/convert-audio', { audio: arrayBuffer }).toPromise();
        // };

    }

    startRecording() {
        this.currentChunks = [];
        this.recorder.start();
    }

    stopRecording() {
        this.recorder.stop();
    }

    setMediaStream() {
        setTimeout(() => {
            this.videoElement.nativeElement.srcObject = this.mediaStream;
        });
    }

    playBuffer(buffer: any) {
        const audioContext = new AudioContext();
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start();
    }

    playAudioBuffer(buffer: any) {
        const audioContext = new AudioContext();
        const source = audioContext.createBufferSource();
        const audioBuffer = audioContext.createBuffer(1, buffer.length, audioContext.sampleRate);
        audioBuffer.getChannelData(0).set(buffer);

        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start();
    }

    ngOnChanges(changes: SimpleChanges): void {
        console.log('changes', changes)
        if (changes['isMobile'] && !changes['isMobile'].firstChange) {
            this.setMediaStream();
        }
    }

    ngOnDestroy(): void {
        if (this.subscribe) {
            this.subscribe.unsubscribe();
        }
        if (this.snapShotInterval) {
            clearInterval(this.snapShotInterval);
        }
    }


    togglePauseLesson(): void {
        if (this.pauseButtonText == "take a break") {
            this.pauseButtonText = "resume lesson"
            this.lessonService.Broadcast("pauseLesson", {})
        } else {
            this.pauseButtonText = "take a break"
            this.lessonService.Broadcast("resumeLesson", {})
        }

    }

    setIcon(iconName: string) {
        console.log('change gif - setIcon', iconName)
        if (this.icons[iconName]) {
            console.log('change gif - setIcon inside if', iconName)
            this.currentIcon = this.icons[iconName];
        }
    }

    nextSlide(){
        this.onNextSlide.emit({});
    }

    prevSlide(){
        this.onPrevSlide.emit({});
    }





}
