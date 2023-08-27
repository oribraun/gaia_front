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

    // @Input('generatingImageInProgress') generatingImageInProgress: boolean = false;

    // @Output('onGenerateImage') onGenerateImage: EventEmitter<any> = new EventEmitter<any>();


    imageSrc = ''

    wordsSelected: string[] = [];

    imagePathGenerated = ''
    generatingImageInProgress = false;

    generatingImage = false;

    constructor(
        private config: Config,
        private apiService: ApiService,
    ) {
        this.imageSrc = this.config.staticImagePath
        this.imagePathGenerated = this.imageSrc + 'assets/images/lesson_placeholder.jpg'
        this.apiService.eventEmit.subscribe((resp:any) => {
            console.log('NIRNIRNIReventEmit', resp)    
            if (resp.data.source == "image_generator_button_click") {
                this.handleGenerateImageOutput(resp.data)
            }
        })
    }

    handleGenerateImageOutput(data: any) {
        console.log('handleGenerateImageOutput', data.image_path)
        this.imagePathGenerated = data.image_path
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
        const inp = {'type':'image_generator_button_click', 'selected_words': this.wordsSelected}
        this.apiService.eventEmit.emit(inp)
    }

}
