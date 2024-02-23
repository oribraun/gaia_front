import {Injectable} from '@angular/core';
import RecordRTC from 'recordrtc';

@Injectable({
    providedIn: 'root'
})
export class AudioRecordingService {
    private stream!: MediaStream;
    private recorder: any;

    private websocket!: WebSocket;

    constructor() {
        this.websocket = new WebSocket('ws://127.0.0.1:8000/ws/audio-upload/');
        this.websocket.onopen = () => {
            console.log('WebSocket connection established.');
        };
        this.websocket.onerror = (err: any) => {
            console.log('WebSocket err', err);
        };
    }

    async startRecording() {
        this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.recorder = new RecordRTC(this.stream, { type: 'audio' });
        this.recorder.startRecording();
    }

    stopRecording(): Promise<Blob> {
        return new Promise((resolve, reject) => {
            this.recorder.stopRecording(() => {
                this.stream.getTracks().forEach(track => track.stop());
                const audioBlob = this.recorder.getBlob();
                resolve(audioBlob);
            });
        });
    }

    async startRecordingStream(): Promise<void> {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.recorder = new MediaRecorder(this.stream);
            const audioTracks = this.stream.getAudioTracks();
            if (audioTracks.length === 0) {
                console.error('No audio track found in the media stream.');
                return;
            }
            audioTracks[0].onended = () => {
                console.error('Audio track ended unexpectedly.');
            };
            //true on Chrome and Opera
            const mimeType = 'audio/webm';
            MediaRecorder.isTypeSupported('audio/webm;codecs=opus');

            //true on Firefox
            MediaRecorder.isTypeSupported('audio/ogg;codecs=opus');

            console.log('MediaRecorder available:', typeof MediaRecorder !== 'undefined');
            // ... rest of the code
            this.recorder = new RecordRTC.StereoAudioRecorder(this.stream, {
                type: 'audio',
                timeSlice: 3000,
                ondataavailable: (blob) => {
                    this.websocket.send(blob);
                },
                mimeType: mimeType // Adjust the mimeType as needed
                // mimeType: 'audio/wav', // Adjust the mimeType as needed
            });
            this.recorder.record();

            // this.recorder.ondataavailable = (event: any) => {
            //     console.log('event.data.size',event.data.size)
            //     if (event.data && event.data.size > 0) {
            //         this.websocket.send(event.data);
            //     }
            // };
            // this.recorder.onstop = function(){
            //     console.log('stop audio call');
            // }
        } catch (error) {
            console.error('Error accessing media stream:', error);
        }
    }

    async stopRecordingStream(): Promise<any> {
        return new Promise((resolve, reject) => {
            if (this.recorder) {
                this.recorder.stop((blob: Blob) => {
                    this.stream.getTracks().forEach(track => track.stop());
                    // this.websocket.send(blob);
                    this.websocket.send('done');
                    resolve(blob);
                    // Handle the final recorded audio blob as needed (e.g., send to the server)
                });
            }
        });
    }
}
