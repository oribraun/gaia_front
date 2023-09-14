import {
    AfterViewInit,
    Component, ElementRef,
    EventEmitter, HostListener,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges, ViewChild,
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
    @Input('recognitionText') recognitionText: string = '';
    @Input('isPause') isPause: boolean = false;
    @Output('onResetPresentation') onResetPresentation: EventEmitter<any> = new EventEmitter<any>();

    @ViewChild('slides', { static: false }) slides!: ElementRef;

    slideWidth: number = -1;
    slideHeight: number = -1;

    public sectionTitles = {
        bundle:'bundle',
        greeting: 'greeting',
        reading: 'reading',
        word_repeater: 'word_repeater',
        image_generator: 'image_generator',
        agenda: 'agenda',
        ending: 'ending',
        video: 'video',
        blanks:'blanks',
        title:'title',
        word_translator:'word_translator'

    }


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
        setTimeout(() => {
            this.setSlidesRelativeWidth();
        })
    }


    setSlidesRelativeWidth() {
        const map = this.data.map(o => o.slide_type).filter((str) => str !== undefined);
        const all_blanks = map.every( v => v === 'blanks' );
        const all_word_repeater = map.every( v => v === 'word_repeater' );
        const desiredRatio = 9/16;
        if(this.slides && this.data.length > 1 && all_word_repeater) {
            const e = this.slides.nativeElement;
            const slidesWidth = e.clientWidth;
            const slidesHeight = e.clientHeight;
            const currentRatio = slidesHeight/slidesWidth;
            if (currentRatio < 1) {
                // width is bigger
                let newWidth = slidesHeight / desiredRatio;
                if (newWidth < slidesWidth) {
                    this.slideWidth = newWidth;
                    this.slideHeight = -1;
                } else {
                    this.slideWidth = -1;
                    this.slideHeight = slidesWidth * desiredRatio;
                }
            } else {
                // height is bigger
                let newHeight = slidesWidth * desiredRatio;
                if (newHeight < slidesHeight) {
                    this.slideWidth = -1;
                    this.slideHeight = newHeight;
                } else {
                    this.slideHeight = -1;
                    this.slideWidth = slidesHeight / desiredRatio;
                }
            }
        } else {
            this.resetSlideStyle();
        }
    }

    resetSlideStyle() {
        this.slideWidth = -1;
        this.slideHeight = -1;
    }

    setData() {
        if (this.currentSlide.bundle_id > -1) {
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
        console.log('changes[\'currentSlide\']', changes['currentSlide'])
        if (changes['currentSlide']) {
            this.setData();
            this.setSlidesRelativeWidth();
        }
    }

    @HostListener('window:resize')
    onWindowResize() {
        this.setSlidesRelativeWidth();
    }



}
