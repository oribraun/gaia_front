import {EventEmitter, Injectable} from '@angular/core';
import {environment} from "../../../../../environments/environment";
import {lastValueFrom, Observable, Subject} from "rxjs";
import {ApiService} from "../api.service";
import {Config} from "../../config";
import {EventsHashTable} from "../../interfaces/eventHashTable";

declare var html2canvas: any;

@Injectable({
    providedIn: 'root'
})
export class SocketRecorderService {
    private socket!: WebSocket;
    private serverBase = environment.serverUrl;
    private socketUrl = '';
    protected socket_path = "ws/recorder_stream"
    private events: EventsHashTable<Subject<any>> = {};

    private mediaRecorder!: MediaRecorder;
    private screenShotEnabled: boolean = false;

    private capturingInterval: any;
    public capturingMediaStream: any = null;

    private lastData: any = {
        audioChunks: null,
        videoChunks: null,
        screenShot: null
    }

    public onConnect: EventEmitter<any> = new EventEmitter<any>();
    public onMessage: EventEmitter<any> = new EventEmitter<any>();
    public onError: EventEmitter<any> = new EventEmitter<any>();
    public onDisconnect: EventEmitter<any> = new EventEmitter<any>();

    startTime: any = null;

    constructor(
        private apiService: ApiService,
        private config: Config
    ) {
        this.config.server_host_subject.subscribe((host) => {
            this.serverBase = this.config.server_host;
            this.setUpSocket();
        })
        if (this.config.server_host) {
            this.serverBase = this.config.server_host;
        }
        this.setUpSocket();
    }

    setUpSocket() {
        let socketBase = "ws://";
        if (this.serverBase.indexOf('http://') > -1) {
            this.serverBase = this.serverBase.replace('http://', '')
        } else if (this.serverBase.indexOf('https://') > -1) {
            this.serverBase = this.serverBase.replace('https://', '')
            socketBase = "wss://";
        }
        // this.serverBase = this.serverBase.replace('https://', '')
        this.socketUrl = socketBase + this.serverBase + this.socket_path;
    }

    connect(room_name: string = '') {
        const socketUrl = this.socketUrl + '/' +  room_name;
        this.socket = new WebSocket(socketUrl);

        this.socket.onopen = () => {
            const message = socketUrl + ' WebSocket connection established.'
            this.onConnect.emit(message)
        };

        this.socket.onmessage = (event) => {
            const o = JSON.parse(event.data)
            const message = o.message
            const data = o.data
            if (message === 'got-recorder-data') {
                console.log('SocketRecorderService got-recorder-data', o)
            }
            if (this.events[message]) {
                this.Broadcast(message, data)
            }
            // Handle received data
        };

        this.socket.onclose = () => {
            const message = socketUrl + ' WebSocket connection closed.'
            this.onDisconnect.emit(message)
        };

        this.socket.onerror = (err) => {
            const message = socketUrl + err
            this.onError.emit(message)
        }
    }

    disconnect() {
        this.socket.close();
    }

    async sendChunksMessage(message: string, details: any, audioChunks: any = {}, videoChunks: any = {}, screenShot: any = null) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            let videoBase64 = null;
            if (videoChunks) {
                videoChunks = await videoChunks.arrayBuffer();
                videoBase64 = this.arrayBufferToBase64(videoChunks);
            }
            const json = {
                message: message, data: {
                    details: details, // start or end
                    audioChunks: audioChunks,
                    videoChunks: videoBase64,
                    screenShot: screenShot
                }
            }
            console.log('SocketRecorderService sendChunksMessage json')
            this.socket.send(JSON.stringify(json));
        }
    }

    sendMessage(message: string, data: any = {}) {
        if (this.socket.readyState === WebSocket.OPEN) {
            const json = {
                message: message, data: data
            }
            console.log('SocketRecorderService sending json', json)
            this.socket.send(JSON.stringify(json));
        }
    }

    setupContinuesRecording2(mediaStream: MediaStream, listenTo = ['video', 'audio', 'screenShot']) {
        // Create a MediaRecorder instance to record the video stream
        if (listenTo.length) {
            if (listenTo.indexOf('video') > -1) {
                this.setUpVideoRecorder(mediaStream);
            }
            if (listenTo.indexOf('screenShot') > -1) {
                this.screenShotEnabled = true;
                // this.setUpScreenRecorder()
            }
        }
    }

    setupContinuesRecording3(mediaStream: MediaStream) {
        this.setUpScreenRecorder(mediaStream);
    }

    startCapturingInterval(user_id: number, lesson_id: string) {
        const details = {
            type: 'start',
            user_id: user_id,
            lesson_id: lesson_id
        }
        this.capturingInterval = setInterval(async () => {
            this.getVideoChunk();
            if (this.screenShotEnabled) {
                this.lastData.screenShot = await this.takeScreenShot();
                console.log('SocketRecorderService screenShot', this.lastData.screenShot)
            }
            setTimeout(() => {
                const message = 'recorder-data'
                // const jsonData = JSON.stringify(recordedChunks.map(chunk => Array.from(chunk)));
                // const json = {message: message, data: jsonData}
                // this.startTime = Date.now()
                this.sendChunksMessage(message, {...details}, this.lastData.audioChunks, this.lastData.videoChunks, this.lastData.screenShot);
                details.type = ''
                this.resetLastChunks();
            })
        },2000)
    }

    startCapturingMediaTest(count = 1, user_id: number, lesson_id: string) {
        const details = {
            type: 'start',
            user_id: user_id,
            lesson_id: lesson_id
        }
        this.capturingInterval = setInterval(async () => {
            this.getVideoChunk();
            if (this.screenShotEnabled) {
                this.lastData.screenShot = await this.takeScreenShot();
                console.log('SocketRecorderService screenShot', this.lastData.screenShot)
            }
            setTimeout(() => {
                const message = 'recorder-data'
                // const jsonData = JSON.stringify(recordedChunks.map(chunk => Array.from(chunk)));
                // const json = {message: message, data: jsonData}
                // this.startTime = Date.now()
                this.sendChunksMessage(message, {...details}, this.lastData.audioChunks, this.lastData.videoChunks, this.lastData.screenShot);
                details.type = '';
                this.resetLastChunks();
                count--;
                if (count <= 0) {
                    this.stopCapturingVideo();
                    clearInterval(this.capturingInterval);
                    setTimeout(() => {
                        details.type = 'end';
                        this.sendChunksMessage(message, {...details}, this.lastData.audioChunks, this.lastData.videoChunks, this.lastData.screenShot);
                    })
                }
            })
        },2000)
    }
    stopCapturingMediaTest(user_id: number, lesson_id: string) {
        clearInterval(this.capturingInterval);
        const details = {
            type: 'end',
            user_id: user_id,
            lesson_id: lesson_id
        }
        const message = 'recorder-data'
        setTimeout(() => {
            this.sendChunksMessage(message, details, this.lastData.audioChunks, this.lastData.videoChunks, this.lastData.screenShot);
        })
    }
    startCapturingTest(count = 1, user_id: number, lesson_id: string) {
        const details = {
            type: 'start',
            user_id: user_id,
            lesson_id: lesson_id
        }
        this.capturingInterval = setInterval(async () => {
            this.getVideoChunk();
            if (this.screenShotEnabled) {
                this.lastData.screenShot = await this.takeScreenShot();
                console.log('SocketRecorderService screenShot', this.lastData.screenShot)
            }
            setTimeout(() => {
                const message = 'recorder-data'
                // const jsonData = JSON.stringify(recordedChunks.map(chunk => Array.from(chunk)));
                // const json = {message: message, data: jsonData}
                // this.startTime = Date.now()
                this.sendChunksMessage(message, {...details}, this.lastData.audioChunks, this.lastData.videoChunks, this.lastData.screenShot);
                details.type = '';
                this.resetLastChunks();
                count--;
                if (count <= 0) {
                    this.stopCapturingVideo();
                    clearInterval(this.capturingInterval);
                    setTimeout(() => {
                        details.type = 'end';
                        this.sendChunksMessage(message, {...details}, this.lastData.audioChunks, this.lastData.videoChunks, this.lastData.screenShot);
                    })
                }
            })
        },2000)
    }

    stopCapturingInterval(user_id: number, lesson_id: string) {
        clearInterval(this.capturingInterval);
        const details = {
            type: 'end',
            user_id: user_id,
            lesson_id: lesson_id
        }
        const message = 'recorder-data'
        setTimeout(() => {
            console.log('this.lastData', this.lastData)
            this.sendChunksMessage(message, details, this.lastData.audioChunks, this.lastData.videoChunks, this.lastData.screenShot);
        })
    }

    setUpScreenRecorder(mediaStream: MediaStream) {
        const options = {
            audioBitsPerSecond: 128000,
            videoBitsPerSecond: 2500000,
            // mimeType: 'audio/webm; codecs=opus',
            audioConstantBitRate: true
            // mimeType: "video/mp4",
        };
        this.mediaRecorder = new MediaRecorder(mediaStream, options);

        // Set up event handlers for the MediaRecorder
        this.mediaRecorder.ondataavailable = (event) => {
            console.log('SocketRecorderService event', event);
            if (event.data.size > 0) {
                console.log('SocketRecorderService event.data', event.data)
                this.lastData.videoChunks = event.data;
                // recordedChunks.push(event.data);
            }
        };
        this.mediaRecorder.onerror = function(error) {
            console.log("SocketRecorderService recorder error", error);
        }
        this.mediaRecorder.onstop = () => {
            //     // Send the recorded video data to the server
            //     sendVideoDataToServer(new Blob(recordedChunks, { type: 'video/webm' }));
            //     recordedChunks = [];
        };

        // mediaRecorder.start();
        // setInterval(() => {
        //     // mediaRecorder.stop();
        //     mediaRecorder.requestData()
        // }, 2000)
        // console.log(mediaRecorder.state);
        // console.log("recorder started");
    }

    setUpVideoRecorder(mediaStream: MediaStream) {
        const options = {
            audioBitsPerSecond: 128000,
            videoBitsPerSecond: 2500000,
            // mimeType: 'audio/webm; codecs=opus',
            audioConstantBitRate: true
            // mimeType: "video/mp4",
        };
        this.mediaRecorder = new MediaRecorder(mediaStream, options);

        // Set up event handlers for the MediaRecorder
        this.mediaRecorder.ondataavailable = (event) => {
            console.log('SocketRecorderService event', event);
            if (event.data.size > 0) {
                console.log('SocketRecorderService event.data', event.data)
                this.lastData.videoChunks = event.data;
                // recordedChunks.push(event.data);
            }
        };
        this.mediaRecorder.onerror = function(error) {
            console.log("SocketRecorderService recorder error", error);
        }
        this.mediaRecorder.onstop = () => {
            //     // Send the recorded video data to the server
            //     sendVideoDataToServer(new Blob(recordedChunks, { type: 'video/webm' }));
            //     recordedChunks = [];
        };

        // mediaRecorder.start();
        // setInterval(() => {
        //     // mediaRecorder.stop();
        //     mediaRecorder.requestData()
        // }, 2000)
        // console.log(mediaRecorder.state);
        // console.log("recorder started");
    }

    setUpDisplayMediaRecorder(mediaStream: MediaStream) {
        const options = {
            audioBitsPerSecond: 128000,
            videoBitsPerSecond: 2500000,
            // mimeType: 'audio/webm; codecs=opus',
            audioConstantBitRate: true
            // mimeType: "video/mp4",
        };
        this.mediaRecorder = new MediaRecorder(mediaStream, options);

        // Set up event handlers for the MediaRecorder
        this.mediaRecorder.ondataavailable = (event) => {
            console.log('SocketRecorderService event', event);
            if (event.data.size > 0) {
                console.log('SocketRecorderService event.data', event.data)
                this.lastData.videoChunks = event.data;
                // recordedChunks.push(event.data);
            }
        };
        this.mediaRecorder.onerror = function(error) {
            console.log("SocketRecorderService recorder error", error);
        }
        this.mediaRecorder.onstop = () => {
            //     // Send the recorded video data to the server
            //     sendVideoDataToServer(new Blob(recordedChunks, { type: 'video/webm' }));
            //     recordedChunks = [];
        };

        // mediaRecorder.start();
        // setInterval(() => {
        //     // mediaRecorder.stop();
        //     mediaRecorder.requestData()
        // }, 2000)
        // console.log(mediaRecorder.state);
        // console.log("recorder started");
    }

    async setUpScreenRecorderOld() {
        this.screenShotEnabled = true;

        const body = document.body;
        console.log('SocketRecorderService body', body);
        return;
        try {
            const displayMediaOptions = {
                video: true
            }
            const captureStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
            console.log('SocketRecorderService captureStream', captureStream)
        } catch (err) {
            console.error(`SocketRecorderService Error: ${err}`);
        }

        // const stream = await startCapture();
        // const track = stream.getVideoTracks()[0];
        // let imageCapture = new ImageCapture(track);
        // imageCapture.grabFrame()
    }

    takeScreenShot() {
        return new Promise((resolve, reject) => {
            if (this.screenShotEnabled) {
                const white_board = document.body.getElementsByClassName('white-board');
                if (white_board && white_board.length) {
                    const container = white_board[0];
                    console.log('SocketRecorderService html2canvas', html2canvas)
                    html2canvas(container, {
                        allowTaint: true,
                        useCORS: true,
                        // foreignObjectRendering: true,
                        logging: false,
                    }).then(function (canvas: any) {
                        // canvas.width = container.clientWidth;
                        // canvas.height = container.clientHeight;
                        // Convert the canvas to a data URL
                        const screenshotDataUrl = canvas.toDataURL('image/png');

                        document.body.append(canvas);

                        // Create a link element to download the screenshot
                        // const downloadLink = document.createElement('a');
                        // downloadLink.href = screenshotDataUrl;
                        // downloadLink.download = 'screenshot.png';
                        // downloadLink.click();

                        resolve(screenshotDataUrl);
                    });
                } else {
                    reject('no white-board class');
                }


            } else {
                reject('screenShot is not active')
            }
        })
    }

    startCapturingVideo() {
        if (this.mediaRecorder) {
            this.mediaRecorder.start();
        }
    }

    getVideoChunk() {
        if (this.mediaRecorder) {
            try {
                // this.capturingInterval = setInterval(() => {
                // mediaRecorder.stop();
                this.mediaRecorder.requestData()
                // }, 2000)
            } catch (e) {
                console.log('SocketRecorderService startCapturing', e)
            }
        }
    }

    stopCapturingVideo() {
        if (this.mediaRecorder) {
            try {
                clearInterval(this.capturingInterval);
                this.mediaRecorder.stop();
            } catch (e) {
                console.log('SocketRecorderService startCapturing', e)
            }
        }
    }

    getLastData() {
        return this.lastData;
    }

    resetLastChunks() {
        this.lastData = {
            audioChunks: null,
            videoChunks: null,
            screenShot: null
        }
    }

    setupContinuesRecording(mediaStream: MediaStream) {
        let recordedChunks: any[] = [];
        const THREASHOLD = 0.1;
        const CHUNK_SIZE = 8192;
        const SILENCE_TIMEOUT = 500;
        let totalSamples = 0;
        let lastSpeak: any = null
        let endedSpeak: any = null
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(mediaStream);

        // Create a ScriptProcessorNode to process audio data
        const scriptNode = audioContext.createScriptProcessor(CHUNK_SIZE, 1, 1);
        let once = 0;
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
                totalSamples += chunk.length;
                console.log('SocketRecorderService totalSamples', totalSamples)
                if (totalSamples >= CHUNK_SIZE) {
                    // this.emitRecorderChunks(recordedChunks);
                    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                        // console.log('sending audio_data')
                        const message = 'recorder-data'
                        const jsonData = JSON.stringify(recordedChunks.map(chunk => Array.from(chunk)));
                        // const json = {message: message, data: jsonData}
                        this.startTime = Date.now()
                        this.sendMessage(message, jsonData)
                    }
                    recordedChunks = [];
                    totalSamples = 0;
                    once++;
                }
            } else {
                const ended = new Date().getTime();
                if (ended - lastSpeak > SILENCE_TIMEOUT) {
                    // const message = 'recorder-data'
                    // this.sendMessage(message, null)
                    if (recordedChunks.length) {
                        // console.log('recordedChunks', recordedChunks)
                        // const audioBuffer: AudioBuffer = this.convertToAudioBuffer(recordedChunks);
                        // const audioData = audioBuffer.getChannelData(0);
                        // const audioArrayBuffer = audioData.buffer; // to send to server
                        // const audioBase64: any = this.arrayBufferToBase64(audioArrayBuffer);
                        // this.onResults.emit({audio_buffer: audioBase64})

                        // const audioChannel = this.convertToAudioAudioChannel(recordedChunks);
                        // const audioArrayBufferr = audioChannel.buffer;
                        // const audioBase64: any = this.arrayBufferToBase64(audioArrayBufferr);
                        if (!once) {
                            // const jsonData = JSON.stringify(recordedChunks.map(chunk => Array.from(chunk)));
                            // this.onResults.emit({audio_chunks: jsonData})
                            // this.emitRecorderChunks(recordedChunks);
                            // once = true;
                        }
                        // this.playBuffer(audioBuffer);
                        recordedChunks = [];
                        totalSamples = 0;
                        // const message = 'audio-data'
                        // const json = {message: message, data: null}
                        // this.socket.send(JSON.stringify(json));
                    }
                } else {
                    // const chunk = new Float32Array(inputData);
                    // recordedChunks.push(chunk);
                    // totalSamples += chunk.length;
                }
                // if (totalSamples >= CHUNK_SIZE && !once) {
                //     this.emitRecorderChunks(recordedChunks);
                //     recordedChunks = [];
                //     totalSamples = 0;
                //     once = true;
                // }
            }
        };

        // Connect the nodes
        source.connect(scriptNode);
        scriptNode.connect(audioContext.destination);
    }

    async setupContinuesRecordAudio3(mediaStream: MediaStream) {
        let recordedChunks: any[] = [];
        const THREASHOLD = 0.1;
        const SILENCE_TIMEOUT = 1000;
        let lastSpeak: any = null
        let endedSpeak: any = null
        const audioContext = new AudioContext();
        const mediaStreamNode = audioContext.createMediaStreamSource(mediaStream);

        await audioContext.audioWorklet.addModule('assets/recorder-worklet.js');
        const recorderNode: any = new AudioWorkletNode(audioContext, 'recorder-worklet');

        mediaStreamNode.connect(recorderNode);
        recorderNode.connect(audioContext.destination);
        let once = false;
        recorderNode.port.onmessage = (e: any) => {
            if (e.data.eventType === 'data') {
                const audioData = e.data.audioBuffer;
                const buffer = audioData.buffer;
                console.log('SocketRecorderService buffer', buffer)

                const numberOfChannels = 1; // Assuming a single channel
                const length = audioData.length;
                const sampleRate = audioContext.sampleRate;

                const newAudioBuffer = audioContext.createBuffer(numberOfChannels, length, sampleRate);

                const channelData = newAudioBuffer.getChannelData(0); // Get the channel data array
                for (let i = 0; i < length; i++) {
                    channelData[i] = audioData[i]; // Copy sample data
                }

                const audioSourceNode = audioContext.createBufferSource();
                audioSourceNode.buffer = newAudioBuffer;
                audioSourceNode.connect(audioContext.destination);
                audioSourceNode.start();

                const base64Data = btoa(String.fromCharCode(...new Uint8Array(buffer)));
                if (!once) {
                    // this.onResults.emit({audio_chunks: base64Data})
                    once = true
                }
                console.log('SocketRecorderService audioData', audioData)
                // process pcm data
            }
            if (e.data.eventType === 'stop') {
                // recording has stopped
            }
        };

        const time = 0;
        const delay = 5;
        recorderNode.parameters.get('isRecording').setValueAtTime(1, time);
        recorderNode.parameters.get('isRecording').setValueAtTime(
            0,
            time + delay
        );

        // recorderNode.port.postMessage('start');
        //
        // // After a certain duration, stop recording
        // setTimeout(() => {
        //     recorderNode.parameters.get('isRecording').setValueAtTime(0, time)
        // //     recorderNode.port.postMessage('stop');
        // }, 5000); // Record for 5 seconds
    }

    async setupContinuesRecordAudio2(mediaStream: MediaStream) {
        let recordedChunks: any[] = [];
        const THREASHOLD = 0.1;
        const CHUNK_SIZE = 8192;
        const SILENCE_TIMEOUT = 500;
        let totalSamples = 0;
        const audioContext = new AudioContext();
        const mediaStreamNode = audioContext.createMediaStreamSource(mediaStream);

        await audioContext.audioWorklet.addModule('assets/recording-processor.js');
        const recorderNode = new AudioWorkletNode(audioContext, 'recording-worklet');

        mediaStreamNode.connect(recorderNode);
        recorderNode.connect(audioContext.destination);

        recorderNode.port.onmessage = event => {
            const recordedData = event.data.recordedData;
            const final = event.data.final;

            // const chunk = new Float32Array(recordedData.flat())
            // const buffer = chunk.buffer;
            // recordedChunks.push(chunk);
            // totalSamples += chunk.length;
            //
            // // if (totalSamples >= CHUNK_SIZE) {
            //     // this.emitRecorderChunks(recordedChunks);
            // if (this.socket.readyState === WebSocket.OPEN) {
            //     // console.log('sending audio_data')
            //     const message = 'audio-data'
            //     const jsonData = JSON.stringify(recordedChunks.map(chunk => Array.from(chunk)));
            //     this.sendMessage(message, jsonData)
            // }
            // recordedChunks = [];
            // totalSamples = 0;
            // Handle the recordedData array (e.g., save to a file or process further)
            if (final) {
                console.log('SocketRecorderService Recording finished:', recordedData);
                audioContext.close();
                // Convert recordedData to ArrayBuffer

                // }

                // Convert ArrayBuffer to Base64
                // const base64Data = btoa(String.fromCharCode(...new Uint8Array(buffer)));
                // console.log('base64Data', base64Data)
                // this.onResults.emit({audio_chunks: base64Data})
            } else {
                // console.log('Recording', recordedData);
            }
        };

        recorderNode.port.postMessage('start');

        // After a certain duration, stop recording
        setTimeout(() => {
            recorderNode.port.postMessage('stop');
        }, 2000); // Record for 5 seconds
    }

    emitRecorderChunks(recordedChunks: any[]) {
        const jsonData = JSON.stringify(recordedChunks.map(chunk => Array.from(chunk)));
        // this.onResults.emit({audio_chunks: jsonData})
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
        console.log('SocketRecorderService startIndex', startIndex)
        console.log('SocketRecorderService endIndex', endIndex)

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

    /**
     * Broadcast - emmit specific event changes
     * param {string} eventName
     * param {any} payload
     * return void;
     */
    private Broadcast(eventName: string, payload?: any): void {
        const event: Subject<any> = this.events[eventName];
        if (event !== null && typeof event !== 'undefined') {
            event.next(payload);
        }
    }

    /**
     * Start to Listen for a choosing event by adding to a list of interesting events
     * param {string} eventName
     * return {Observable} Observable;
     */
    public ListenFor(eventName: string): Observable<any> {
        let event: Subject<any> = this.events[eventName];
        if (event === null || typeof event === 'undefined') {
            event = new Subject<any>();
            this.events[eventName] = event;
        }
        return event.asObservable();
    }

    /**
     * Stop Listening for a choosing event
     * param {string} eventName
     * return {Observable} Observable;
     */
    public ClearEvent(eventName: string): void {
        delete this.events[eventName];
    }

    /**
     * Unsubscribe all events listening - memory perspective
     * return void;
     */
    public ClearAllEvents() {
        for (const name in this.events) {
            this.events[name].unsubscribe();
            delete this.events[name];
        }
    }
}
