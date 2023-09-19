import {Component, Input, OnInit} from '@angular/core';
import {PresentationSlide} from "../../../entities/presentation";
import {Config} from "../../../config";
import {environment} from "../../../../environments/environment";

@Component({
    selector: 'app-base-slide',
    template: ''
})
export class BaseSlideComponent implements OnInit {

    @Input('currentSlide') currentSlide: PresentationSlide = new PresentationSlide();
    @Input('slideData') slideData: any = {};

    imageSrc = ''
    currentHost = ''

    constructor(
        protected config: Config,
    ) {
        this.imageSrc = this.config.staticImagePath;
        this.currentHost = this.config.server_host || environment.serverUrl;
        console.log('this.config.server_host', this.config.server_host)
    }

    ngOnInit(): void {
        this.fixImagesUrls();
    }



    fixImagesUrls() {
        if (this.currentSlide.background_image && !this.checkIsFullUrl(this.currentSlide.background_image)) {
            this.currentSlide.background_image = (this.currentHost + this.currentSlide.background_image).replace(/(https?:\/\/)|(\/)+/g, "$1$2");
        }
        if (this.currentSlide.teacher_image_path && !this.checkIsFullUrl(this.currentSlide.teacher_image_path)) {
            this.currentSlide.teacher_image_path = (this.currentHost + this.currentSlide.teacher_image_path).replace(/(https?:\/\/)|(\/)+/g, "$1$2");
        }
        if (this.currentSlide.word_image_path && !this.checkIsFullUrl(this.currentSlide.word_image_path)) {
            this.currentSlide.word_image_path = (this.currentHost + this.currentSlide.word_image_path).replace(/(https?:\/\/)|(\/)+/g, "$1$2");
        }
    }

    checkIsFullUrl(url: string) {
        return url.indexOf('http://') > -1 || url.indexOf('https://') > -1;
    }

}
