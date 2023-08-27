import {Component, EventEmitter, Input, Output} from '@angular/core';
import {PresentationSlide} from "../../../../entities/presentation";
import {Config} from "../../../../config";
import {ApiService} from "../../../../services/api.service";

@Component({
    selector: 'app-image-generator',
    templateUrl: './image-generator.component.html',
    styleUrls: ['./image-generator.component.less']
})
export class ImageGeneratorComponent {

    @Input('currentSlide') currentSlide: PresentationSlide = new PresentationSlide();

    @Output('onGenerateImage') onGenerateImage: EventEmitter<any> = new EventEmitter<any>();

    @Output('generatingImageInProgress') generatingImageInProgress: boolean = false;

    imageSrc = ''

    wordsSelected: string[] = [];

    imagePathGenerated = ''

    generatingImage = false;

    constructor(
        private config: Config,
        private apiService: ApiService,
    ) {
        this.imageSrc = this.config.staticImagePath
        this.imagePathGenerated = this.imageSrc + 'assets/images/lesson_placeholder.jpg'
    }

    onCheckboxChange(word:string, event: any) {
        if(event.target.checked) {
            this.wordsSelected.push(word);
        } else {
            let index = this.wordsSelected.indexOf(word);
            this.wordsSelected.splice(index,1);
        }
    }

    generateImage() {
        if (!this.wordsSelected.length){
            return;
        }
        this.onGenerateImage.emit(this.wordsSelected)
    }

}
