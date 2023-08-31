import {Entity} from "./entity";

export class ChatMessage extends Entity {
    type!: string;
    message!: string;
    isFinal!: boolean;

}
