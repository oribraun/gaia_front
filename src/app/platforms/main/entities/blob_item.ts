import { type } from "os";
import {Entity} from "./entity";

export class BlobItem extends Entity {
    arrayBuffer!: ArrayBuffer;
    action!: string;
    type!: string;
    static includes(items: BlobItem[], arrayBuffer: ArrayBuffer) {
        const map = items.map(item => item.arrayBuffer);
        return map.includes(arrayBuffer);
    }
}
