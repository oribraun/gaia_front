import {Entity} from "./entity";

export class ChatMessage extends Entity {
    type!: string;
    message!: string;
    translatedMessage!: string;
    isFinal!: boolean;
    showTranslated: boolean = false;
}
