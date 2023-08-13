import {Inject, Injectable} from '@angular/core';
import {DOCUMENT} from "@angular/common";

@Injectable({
    providedIn: 'root'
})
export class AnimationsService {

    constructor(
        @Inject(DOCUMENT) private document: Document,
    ) { }

    addCircle(elm: any, unique_num: number) {
        if (elm) {
            var randomColor = Math.floor(Math.random()*16777215).toString(16);
            const child = this.document.createElement('div');
            // const transformSpeed = this.randomIntFromInterval(1, 1.5)
            const transformSpeed = 1.5;
            child.id = "circle-animation-" + unique_num
            child.style.position = "absolute";
            child.style.top = "0";
            child.style.right = "0";
            child.style.bottom = "0";
            child.style.left = "0";
            child.style.opacity = "0";
            child.style.zIndex = "-1";
            child.style.borderRadius = "100%";
            child.style.border = "1px solid " + "#" + randomColor;
            child.style.transform = "scale(.9)";
            child.style.transition = `transform ${transformSpeed}s ease-in-out, opacity ${transformSpeed}s ease-in-out`;
            elm.appendChild(child);
            this.animateAndRemoveCircle(child.id, transformSpeed)
        }
    }

    animateAndRemoveCircle(id: string, transformSpeed: number) {
        setTimeout(() => {
            const e = document.getElementById(id);
            if (e) {
                const scale = this.randomIntFromInterval(1.4, 1.8)
                e.style.transform = `scale(${scale})`;
                e.style.opacity = "1";
                setTimeout(() => {
                    e.style.transition = `transform ${transformSpeed}s ease-in-out, opacity ${transformSpeed/1.5}s ease-in-out`;
                    e.style.opacity = "0";
                }, transformSpeed/1.5 * 1000)
                setTimeout(() => {
                    setTimeout(() => {
                        e.remove();
                    }, 600);
                }, transformSpeed * 1000)
            }
        },50);
    }

    randomIntFromInterval(min: number, max: number) { // min and max included
        return Math.floor(Math.random() * (max - min + 1) + min)
    }
}
