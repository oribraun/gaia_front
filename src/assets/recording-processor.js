// recording-processor.js
class RecordingWorklet extends AudioWorkletProcessor {
    constructor() {
        super();
        this.recordedData = [];
        this.started = false;
        this.port.onmessage = event => {
            if (event.data === 'start') {
                this.recordedData = [];
                this.started = true;
            } else if (event.data === 'stop') {
                this.port.postMessage({ recordedData: this.recordedData, final: true });
                this.started = false;
            }
        };
    }

    process(inputs, outputs, parameters) {
        const input = inputs[0];

        for (let channel = 0; channel < input.length; ++channel) {
            this.recordedData.push(new Float32Array(input[channel]));
        }
        if (this.started) {
            this.port.postMessage({ recordedData: this.recordedData, final: false });
        }

        return true;
    }
}

registerProcessor('recording-worklet', RecordingWorklet);
