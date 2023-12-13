import {AfterViewInit, Directive, ElementRef, HostListener, Input, OnInit} from '@angular/core';

@Directive({
    selector: '[appDynamicFontSize]'
})
export class DynamicFontSizeDirective implements OnInit, AfterViewInit {

    @Input() fontSize!: number;
    @Input() maxFontSizePx!: number;
    @Input() minFontSizePx!: number;
    @Input() baseParentWidth!: number;
    private units = 'px';
    private parentWidth!: number;
    constructor(
        private element: ElementRef
    ) { }

    ngOnInit() {

    }

    ngAfterViewInit() {
        this.setFont();
        this.checkParentWidth();
    }

    @HostListener('window:resize', ['$event'])
    onResize($event: Event) {
        // console.log($event);
        this.setFont();
    }

    setFont() {
        this.parentWidth = this.element.nativeElement.parentElement.clientWidth;
        const currentRatio = this.parentWidth / this.baseParentWidth;
        let currentFont = currentRatio * this.fontSize;
        if (currentFont < this.minFontSizePx) {
            currentFont = this.minFontSizePx;
        }
        if (currentFont > this.maxFontSizePx) {
            currentFont = this.maxFontSizePx;
        }
        this.element.nativeElement.style.fontSize = currentFont + this.units;
        this.element.nativeElement.style.lineHeight = currentFont + this.units;
    }

    checkParentWidth() {
        if (this.element && this.element.nativeElement.parentElement.clientWidth !== this.parentWidth) {
            this.setFont();
        }
        setTimeout(() => { this.checkParentWidth(); }, 100);
    }
}
