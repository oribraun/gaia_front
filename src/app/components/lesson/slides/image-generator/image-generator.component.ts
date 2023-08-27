import {Component, Input} from '@angular/core';
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
        this.generatingImage = true;
        console.log('this.wordsSelected',this.wordsSelected)
        this.apiService.generateImage({words: this.wordsSelected}).subscribe({
            next: (response: any) => {
                if (!response.err) {
                    this.imagePathGenerated = response.image_path
                } else {
                    console.log('generateImage response Error', response)
                }
                this.generatingImage = false;
            },
            error: (error: any) => {
                console.log('generateImage Error', error)
                this.generatingImage = false;
            },
        })

    }

}
