import {EventEmitter, Inject, Injectable} from '@angular/core';
import {DOCUMENT} from "@angular/common";
import {timeout} from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class AnimationsService {

    onAddCircle: EventEmitter<any> = new EventEmitter<any>();

    timeouts: any = {}

    constructor(
        @Inject(DOCUMENT) private document: Document,
    ) { }

    triggerAddingCircle(unique_num: number) {
        this.onAddCircle.emit({unique_num})
    }

    addCircle(elm: any, unique_num: number) {
        if (elm) {
            var randomColor = this.getRandomColor();
            const child = this.document.createElement('div');
            // const transformSpeed = this.randomIntFromInterval(1, 1.5)
            const transformSpeed = 1.5;
            child.id = "circle-animation-" + unique_num
            child.className = "circle-animations"
            child.style.position = "absolute";
            child.style.top = "0";
            child.style.right = "0";
            child.style.bottom = "0";
            child.style.left = "0";
            child.style.opacity = "0";
            child.style.zIndex = "-1";
            child.style.borderRadius = "100%";
            child.style.border = "1px solid " + randomColor;
            child.style.transform = "scale(1)";
            child.style.transition = `transform ${transformSpeed}s ease-in-out, opacity ${transformSpeed}s ease-in-out`;
            elm.appendChild(child);
            this.animateAndRemoveCircle(child.id, transformSpeed)
        }
    }

    removeAllCircles(elm: any) {
        this.clearTimeouts();
        const circles = document.querySelectorAll('.circle-animations');
        circles.forEach(circle => {
            circle.remove();
        });
    }

    clearTimeouts() {
        for (let timeout in this.timeouts) {
            console.log('timeout', timeout)
            if (timeout) {
                clearTimeout(timeout)
            }
        }
    }

    animateAndRemoveCircle(id: string, transformSpeed: number) {
        this.timeouts['one_' + id] = setTimeout(() => {
            delete this.timeouts['one_' + id];
            const e = document.getElementById(id);
            if (e) {
                const scale = this.getRandomFloat(1.1, 1.8)
                e.style.transform = `scale(${scale})`;
                e.style.opacity = "1";
                this.timeouts['two_' + id] = setTimeout(() => {
                    delete this.timeouts['two_' + id];
                    e.style.transition = `transform ${transformSpeed}s ease-in-out, opacity ${transformSpeed/1.5}s ease-in-out`;
                    e.style.opacity = "0";
                }, transformSpeed/1.5 * 1000)
                this.timeouts['three_' + id] = setTimeout(() => {
                    delete this.timeouts['three_' + id];
                    this.timeouts['four_' + id] = setTimeout(() => {
                        delete this.timeouts['four_' + id];
                        // e.remove();
                    }, 600);
                }, transformSpeed * 1000)
            }
        },50);
    }

    randomIntFromInterval(min: number, max: number) { // min and max included
        return Math.floor(Math.random() * (max - min + 1) + min)
    }

    getRandomFloat(min: number, max: number) {
        return (Math.random() * (max - min) + min).toFixed(2);
    }

    getRandomColor() {
        const red = Math.floor(Math.random() * 256); // Random value between 0 and 255
        const green = Math.floor(Math.random() * 256); // Random value between 0 and 255
        const blue = Math.floor(Math.random() * 256); // Random value between 0 and 255
        return `rgb(${red},${green},${blue})`;
    }
}
