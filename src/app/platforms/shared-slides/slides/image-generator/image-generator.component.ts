import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Config} from "../../../main/config";
import {BaseSlideComponent} from "../base-slide.component";
import {LessonService} from "../../../main/services/lesson/lesson.service";
import {ApiService} from "../../../main/services/api.service";

@Component({
    selector: 'app-image-generator',
    templateUrl: './image-generator.component.html',
    styleUrls: ['./image-generator.component.less']
})
export class ImageGeneratorComponent extends BaseSlideComponent implements OnInit, OnDestroy {

    // @Input('generatingImageInProgress') generatingImageInProgress: boolean = false;

    // @Output('onGenerateImage') onGenerateImage: EventEmitter<any> = new EventEmitter<any>();


    wordsSelected: string[] = [];

    imagePathGenerated = ''
    generatingImageInProgress = false;

    generatingImage = false;

    constructor(
        protected override config: Config,
        private apiService: ApiService,
        protected override lessonService: LessonService
    ) {
        super(config, lessonService)
    }
    override ngOnInit(): void {
        super.ngOnInit();
        this.imagePathGenerated = this.imageSrc + 'assets/images/lesson/lesson_placeholder.jpg'
        this.lessonService.ListenFor("slideEventReply").subscribe((resp:any) => {
            if (resp.data.source == "image_generator_button_click") {
                this.handleGenerateImageOutput(resp.data)
            }
            if (resp.data.source == "image_generator_button_click_error") {
                this.generatingImageInProgress = false;
                // TODO deal with error's
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
        const data = {
            "source": "image_generator_button_click",
            'selected_words': this.wordsSelected,
            'stopAudio': true
        }
        this.generatingImageInProgress = true;
        this.lessonService.Broadcast("slideEventRequest", data)
    }

    override ngOnDestroy(): void {
        super.ngOnDestroy();
        // this.lessonService.ClearEvent("slideEventReply")
    }



}
