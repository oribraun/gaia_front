import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
} from '@angular/core';
import {PresentationSection, PresentationSlide} from "../../../entities/presentation";
import {ApiService} from "../../../services/api.service";
import {Config} from "../../../config";
import {LessonService} from "../../../services/lesson/lesson.service";


@Component({
    selector: 'app-white-board',
    templateUrl: './white-board.component.html',
    styleUrls: ['./white-board.component.less'],
})
export class WhiteBoardComponent implements OnInit, OnChanges {

    @Input('currentSection') currentSection: PresentationSection = new PresentationSection();
    @Input('currentSlide') currentSlide!: PresentationSlide;
    @Input('sectionTitles') sectionTitles: any = {};
    @Input('recognitionText') recognitionText: string = '';
    @Input('isPause') isPause: boolean = false;
    @Output('onResetPresentation') onResetPresentation: EventEmitter<any> = new EventEmitter<any>();


    presentationResetIsInProgress = false;

    apiSubscriptions: any = {
        reset: null,
    }

    imageSrc = ''

    data: any[] = []

    constructor(
        private config: Config,
        private apiService: ApiService,
        public lessonService: LessonService,
    ) {
        this.imageSrc = this.config.staticImagePath
    }

    ngOnInit(): void {
    }



    setData() {
        if (this.currentSlide.bundle_id>-1) {
            this.data = this.currentSlide.bundle;
        } else {
            this.data = [this.currentSlide]
        }

    }
    async resetPresentation(reason: string = '') {
        if (this.presentationResetIsInProgress) {
            return;
        }
        this.presentationResetIsInProgress = true;
        this.apiSubscriptions.reset = this.apiService.resetPresentation({
            app_data: {
                type: reason
            }
        }).subscribe({
            next: (response: any) => {
                this.presentationResetIsInProgress = false;
                this.onResetPresentation.emit(response)
            },
            error: (error) => {
                this.presentationResetIsInProgress = false;
                console.log('resetPresentation error', error)
            },
        })
    }
    speakNative(text:string){
        console.log('speakNative-emit', text)
        this.lessonService.Broadcast('speakNative', {'text':text})       
    }

    getSlideToRender(){
        return this.currentSlide.slide_type
    }

    isSlideToRender(slideType:string){
        const slideToRender = this.getSlideToRender()
        return slideToRender === slideType
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['currentSlide']) {
             this.setData()
        }
    }



}
