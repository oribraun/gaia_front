class RecorderWorkletProcessor extends AudioWorkletProcessor {
    static get parameterDescriptors() {
        return [{
            name: 'isRecording',
            defaultValue: 0
        }];
    }

    constructor() {
        super();
        this._bufferSize = 2048*2;
        this._buffer = new Float32Array(this._bufferSize);
        this._initBuffer();

        this.port.onmessage = event => {
            if (event.data === 'start') {
                this.started = true;
            } else if (event.data === 'stop') {
                this._flush();
                this._recordingStopped();
                this.started = false;
            }
        };
    }

    _initBuffer() {
        this._bytesWritten = 0;
    }

    _isBufferEmpty() {
        return this._bytesWritten === 0;
    }

    _isBufferFull() {
        return this._bytesWritten === this._bufferSize;
    }

    _appendToBuffer(value) {
        if (this._isBufferFull()) {
            this._flush();
        }

        this._buffer[this._bytesWritten] = value;
        this._bytesWritten += 1;
    }

    _flush() {
        this._send_buffer();
        this._initBuffer();
    }

    _send_buffer() {
        let buffer = this._buffer;
        if (this._bytesWritten < this._bufferSize) {
            buffer = buffer.slice(0, this._bytesWritten);
        }

        this.port.postMessage({
            eventType: 'data',
            audioBuffer: buffer
        });
    }

    _recordingStopped() {
        this.port.postMessage({
            eventType: 'stop'
        });
    }

    process(inputs, outputs, parameters) {
        const isRecordingValues = parameters.isRecording;

        for (
            let dataIndex = 0;
            dataIndex < isRecordingValues.length;
            dataIndex++
        ) {
            const shouldRecord = isRecordingValues[dataIndex] === 1;
            if (!shouldRecord && !this._isBufferEmpty()) {
                this._flush();
                this._recordingStopped();
            }

            if (shouldRecord) {
                this._appendToBuffer(inputs[0][0][dataIndex]);
            }
        }

        return true;
    }

}

registerProcessor('recorder-worklet', RecorderWorkletProcessor);
