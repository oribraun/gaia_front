import {Component, EventEmitter, Input, OnDestroy, Output} from '@angular/core';
import {PresentationSlide} from "../../../../entities/presentation";
import {Config} from "../../../../config";
import {ApiService} from "../../../../services/api.service";
import {LessonService} from "../../../../services/lesson/lesson.service";
import {BaseSlideComponent} from "../base-slide.component";

@Component({
    selector: 'app-image-generator',
    templateUrl: './image-generator.component.html',
    styleUrls: ['./image-generator.component.less']
})
export class ImageGeneratorComponent extends BaseSlideComponent implements OnDestroy {

    // @Input('generatingImageInProgress') generatingImageInProgress: boolean = false;

    // @Output('onGenerateImage') onGenerateImage: EventEmitter<any> = new EventEmitter<any>();


    wordsSelected: string[] = [];

    imagePathGenerated = ''
    generatingImageInProgress = false;

    generatingImage = false;

    constructor(
        protected override config: Config,
        private apiService: ApiService,
        private lessonService: LessonService,
    ) {
        super(config)
        this.imagePathGenerated = this.imageSrc + 'assets/images/lesson/lesson_placeholder.jpg'
        this.lessonService.ListenFor("slideEventReply").subscribe((resp:any) => {
            if (resp.data.source == "image_generator_button_click") {
                this.handleGenerateImageOutput(resp.data)
            }
        })
    }

    handleGenerateImageOutput(data: any) {
        console.log('handleGenerateImageOutput', data.image_path)
        const image = new Image()
        image.src = data.image_path;
        image.onload = () => {
            this.imagePathGenerated = data.image_path;
            setTimeout(() => {
                this.generatingImageInProgress = false;
            }, 500);
        }
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
        if (!this.wordsSelected.length || this.generatingImageInProgress){
            return;
        }
        const data = {"source": "image_generator_button_click", 'selected_words': this.wordsSelected}
        this.generatingImageInProgress = true;
        this.lessonService.Broadcast("slideEventRequest", data)
    }

    ngOnDestroy(): void {
        // this.lessonService.ClearEvent("slideEventReply")
    }



}
