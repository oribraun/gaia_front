import {Entity} from "./entity";

export class ChatMessage {
    type!: string;
    message!: string;
    audio!: string;
    audioBlob!: Blob;
    translatedMessage: string = '';
    isFinal!: boolean;
    showTranslated: boolean = false;

    constructor(v: Partial<ChatMessage> = {}) {
        Object.assign(this, v);
    }
}
