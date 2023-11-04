import {Directive, ElementRef, EventEmitter, HostListener, Output} from '@angular/core';

@Directive({
    selector: '[appSwipe]'
})
export class SwipeDirective {
    private startX!: number;
    private startY!: number;

    private delta = 50;

    @Output() swipeLeft = new EventEmitter<void>();
    @Output() swipeRight = new EventEmitter<void>();

    constructor(private el: ElementRef) {}

    @HostListener('touchstart', ['$event'])
    onTouchStart(event: TouchEvent): void {
        this.startX = event.touches[0].clientX;
        this.startY = event.touches[0].clientY;
    }

    @HostListener('touchmove', ['$event'])
    onTouchMove(event: TouchEvent): void {
        const currentX = event.touches[0].clientX;
        const currentY = event.touches[0].clientY;

        const deltaX = currentX - this.startX;
        const deltaY = currentY - this.startY;

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            event.preventDefault(); // Prevent vertical scrolling
        }
    }

    @HostListener('touchend', ['$event'])
    onTouchEnd(event: TouchEvent): void {
        const deltaX = event.changedTouches[0].clientX - this.startX;

        if (deltaX > this.delta) {
            this.swipeRight.emit();
        } else if (deltaX < -this.delta) {
            this.swipeLeft.emit();
        }
    }

    @HostListener('mousedown', ['$event'])
    onMouseDown(event: MouseEvent): void {
        this.startX = event.clientX;
    }

    @HostListener('mousemove', ['$event'])
    onMouseMove(event: MouseEvent): void {
        const deltaX = event.clientX - this.startX;

        if (Math.abs(deltaX) > 10) {
            event.preventDefault(); // Prevent text selection
        }
    }

    @HostListener('mouseup', ['$event'])
    onMouseUp(event: MouseEvent): void {
        const deltaX = event.clientX - this.startX;

        if (deltaX > this.delta) {
            this.swipeRight.emit();
        } else if (deltaX < -this.delta) {
            this.swipeLeft.emit();
        }
    }

}
