import {
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy, Output,
    SimpleChanges,
    ViewChild
} from '@angular/core';
import {Presentation} from "../../../entities/presentation";
import {AnimationsService} from "../../../services/animations/animations.service";
import {environment} from "../../../../environments/environment";
import {Config} from "../../../config";

@Component({
    selector: 'app-panel-board',
    templateUrl: './panel-board.component.html',
    styleUrls: ['./panel-board.component.less']
})
export class PanelBoardComponent implements OnChanges, OnDestroy {

    @Input('presentation') presentation: Presentation = new Presentation();
    @Input('currentSectionIndex') currentSectionIndex: number = -1;
    @Input('isMobile') isMobile: boolean = false;

    @ViewChild('videoElement', { static: false }) videoElement!: ElementRef;
    @ViewChild('user', { static: false }) user!: ElementRef;

    @Output('onResults') onResults: EventEmitter<any> = new EventEmitter<any>();

    mediaStream: any;

    subscribe: any;

    imageSrc = ''

    recorder: any;
    currentChunks: any[] = []

    constructor(
        private config: Config,
        private animationsService: AnimationsService,
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

    listenToCircleAnimations() {
        this.subscribe = this.animationsService.onAddCircle.subscribe((obj) => {
            this.animationsService.addCircle(this.user.nativeElement, obj.unique_num)
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
                        // this.setUpRecorder();
                        // this.startRecording();
                        this.setupContinuesRecordAudio();
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

    setupContinuesRecordAudio() {
        let recordedChunks: any[] = [];
        const THREASHOLD = 0.1;
        const SILENCE_TIMEOUT = 1000;
        let lastSpeak: any = null
        let endedSpeak: any = null
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(this.mediaStream);

        // Create a ScriptProcessorNode to process audio data
        const scriptNode = audioContext.createScriptProcessor(4096, 1, 1);
        let once = false;
        // Callback function when audio data is available
        scriptNode.onaudioprocess = (event) => {
            const inputData = event.inputBuffer.getChannelData(0);

            // Detect if the user is speaking
            const isSpeaking = inputData.some(sample => Math.abs(sample) > THREASHOLD);

            // If the user is speaking, store the audio chunk
            if (isSpeaking) {
                lastSpeak = new Date().getTime();
                const chunk = new Float32Array(inputData);
                recordedChunks.push(chunk);
            } else {
                const ended = new Date().getTime();
                if (ended - lastSpeak > SILENCE_TIMEOUT) {
                    if (recordedChunks.length) {
                        // console.log('recordedChunks', recordedChunks)
                        const audioBuffer: AudioBuffer = this.convertToAudioBuffer(recordedChunks);
                        // const audioData = audioBuffer.getChannelData(0);
                        // const audioArrayBuffer = audioData.buffer; // to send to server
                        // const audioBase64: any = this.arrayBufferToBase64(audioArrayBuffer);
                        // this.onResults.emit({audio_buffer: audioBase64})

                        // const audioChannel = this.convertToAudioAudioChannel(recordedChunks);
                        // const audioArrayBufferr = audioChannel.buffer;
                        // const audioBase64: any = this.arrayBufferToBase64(audioArrayBufferr);
                        if (!once) {
                            const jsonData = JSON.stringify(recordedChunks.map(chunk => Array.from(chunk)));
                            // this.onResults.emit({audio_chunks: jsonData})
                            // once = true;
                        }
                        // this.playBuffer(audioBuffer);
                        recordedChunks = [];
                    }
                } else {
                    const chunk = new Float32Array(inputData);
                    recordedChunks.push(chunk);
                }
            }
        };

        // Connect the nodes
        source.connect(scriptNode);
        scriptNode.connect(audioContext.destination);
    }

    convertToAudioBuffer(recordedChunks: any): AudioBuffer {
        const audioContext = new AudioContext();
        const audioBuffer = audioContext.createBuffer(1, recordedChunks.length * 4096, audioContext.sampleRate);
        const audioChannel = audioBuffer.getChannelData(0);

        // Concatenate recorded chunks
        let offset = 0;
        for (const chunk of recordedChunks) {
            audioChannel.set(chunk, offset);
            offset += chunk.length;
        }

        return audioBuffer;
    }

    convertToAudioAudioChannel(recordedChunks: any) {
        const audioContext = new AudioContext();
        const audioBuffer = audioContext.createBuffer(1, recordedChunks.length * 4096, audioContext.sampleRate);
        const audioChannel = audioBuffer.getChannelData(0);

        // Concatenate recorded chunks
        let offset = 0;
        for (const chunk of recordedChunks) {
            audioChannel.set(chunk, offset);
            offset += chunk.length;
        }

        return audioChannel;
    }

    arrayBufferToBase64(arrayBuffer: ArrayBuffer) {
        const uint8Array = new Uint8Array(arrayBuffer);
        let binary = '';
        for (let i = 0; i < uint8Array.length; i++) {
            binary += String.fromCharCode(uint8Array[i]);
        }
        return btoa(binary);
    }

    convertToBinaryData(audioBuffer: AudioBuffer) {
        const channelData = audioBuffer.getChannelData(0);
        const floatArray = new Float32Array(channelData.length);
        for (let i = 0; i < channelData.length; i++) {
            floatArray[i] = channelData[i];
        }
        return floatArray.buffer;
    }

    applyNoiseGate(audioBuffer: AudioBuffer, threshold: number) {
        const audioData = audioBuffer.getChannelData(0);
        for (let i = 0; i < audioData.length; i++) {
            if (Math.abs(audioData[i]) < threshold) {
                audioData[i] = 0; // Set low-amplitude samples to zero
            }
        }
    }


    convertToAudioBufferWithNoiseReduction(recordedChunks: any) {
        const noiseThreshold = 0.5;
        const audioContext = new AudioContext();
        const audioBuffer = audioContext.createBuffer(1, recordedChunks.length * 4096, audioContext.sampleRate);
        const audioChannel = audioBuffer.getChannelData(0);

        this.applyNoiseGate(audioBuffer, noiseThreshold);
        // Concatenate recorded chunks
        let offset = 0;
        for (const chunk of recordedChunks) {
            const chunkCopy = new Float32Array(chunk); // Create a copy of the chunk
            const chunkBuffer = audioContext.createBuffer(1, chunkCopy.length, audioContext.sampleRate);
            chunkBuffer.copyToChannel(chunkCopy, 0); // Convert to an AudioBuffer
            this.applyNoiseGate(chunkBuffer, noiseThreshold); // Apply noise reduction
            audioChannel.set(chunkBuffer.getChannelData(0), offset);
            offset += chunkBuffer.length;
        }

        return audioBuffer;
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

    async trimSilentParts(arrayBuffer: ArrayBuffer) {
        const audioContext = new AudioContext();

        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        const audioData = audioBuffer.getChannelData(0); // Assuming mono audio

        // Find non-silent regions
        const threshold = 0.05; // Adjust this threshold as needed
        let startIndex = 0;
        let endIndex = audioData.length - 1;

        // Find the start index of non-silent audio
        for (let i = 0; i < audioData.length; i++) {
            if (Math.abs(audioData[i]) > threshold) {
                startIndex = i;
                break;
            }
        }

        // Find the end index of non-silent audio
        for (let i = audioData.length - 1; i >= 0; i--) {
            if (Math.abs(audioData[i]) > threshold) {
                endIndex = i;
                break;
            }
        }

        const trimmedBuffer = audioContext.createBuffer(
            audioBuffer.numberOfChannels,
            endIndex - startIndex + 1,
            audioBuffer.sampleRate
        );
        console.log('startIndex', startIndex)
        console.log('endIndex', endIndex)

        for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
            const trimmedChannelData = audioData.subarray(startIndex, endIndex + 1);
            trimmedBuffer.getChannelData(channel).set(trimmedChannelData);
        }

        // // Step 3: Create a new Float32Array containing non-silent audio
        // const trimmedLength = endIndex - startIndex + 1;
        // const trimmedFloat32Array = new Float32Array(trimmedLength);
        //
        // for (let i = startIndex, j = 0; i <= endIndex; i++, j++) {
        //     trimmedFloat32Array[j] = audioData[i];
        // }
        // // Convert the trimmed Float32Array back to ArrayBuffer
        // const outputArrayBuffer = new ArrayBuffer(trimmedFloat32Array.length * 4);
        // const outputDataView = new DataView(outputArrayBuffer);
        //
        // for (let i = 0; i < trimmedFloat32Array.length; i++) {
        //     outputDataView.setFloat32(i * 4, trimmedFloat32Array[i], true);
        // }

        return trimmedBuffer;
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





}
