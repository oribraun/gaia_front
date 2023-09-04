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
    @ViewChild('user', { static: false }) userElement!: ElementRef;

    @Output('onResults') onResults: EventEmitter<any> = new EventEmitter<any>();

    mediaStream: any;

    subscribe: any;

    imageSrc = ''
    pauseButtonText = "take a break"
    recorder: any;
    currentChunks: any[] = []

    showTeacherIcon = true;

    constructor(
        private config: Config,
        private animationsService: AnimationsService,
        private lessonService: LessonService,
    ) {
        this.listenToCircleAnimations();

        this.imageSrc = this.config.staticImagePath;

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
    }

    ngOnInit(): void {

    }

    listenToCircleAnimations() {
        this.subscribe = this.animationsService.onAddCircle.subscribe((obj) => {
            this.animationsService.addCircle(this.userElement.nativeElement, obj.unique_num)
        })
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
    }


    togglePauseLesson(): void {
        console.log('Daniel')

        if (this.pauseButtonText == "take a break") {
            this.pauseButtonText = "resume lesson"
            this.lessonService.Broadcast("pauseLesson", {})
        } else {
            this.pauseButtonText = "take a break"
            this.lessonService.Broadcast("resumeLesson", {})
        }

    }

    changeToUserIcon() {
        this.showTeacherIcon = false;
    }

    changeToTeacherIcon() {
        this.showTeacherIcon = true;
    }





}
