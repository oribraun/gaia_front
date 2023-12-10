import {
    AfterViewInit,
    Component, ElementRef,
    EventEmitter, HostListener,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges, ViewChild
} from '@angular/core';
import {PresentationSection, PresentationSlide} from "../../../../shared-slides/entities/presentation";
import {ApiService} from "../../../services/api.service";
import {Config} from "../../../config";
import {LessonService} from "../../../services/lesson/lesson.service";
import {User} from "../../../../shared-slides/entities/user";


@Component({
    selector: 'app-white-board',
    templateUrl: './white-board.component.html',
    styleUrls: ['./white-board.component.less']
})
export class WhiteBoardComponent implements OnInit, OnChanges {

    @Input() currentSection: PresentationSection = new PresentationSection();
    @Input() currentSlide!: PresentationSlide;
    @Input() recognitionText: string = '';
    @Input() isPause: boolean = false;
    @Output() onResetPresentation: EventEmitter<any> = new EventEmitter<any>();

    @ViewChild('slides', { static: false }) slides!: ElementRef;

    slideWidth: number = -1;
    slideHeight: number = -1;

    private user!: User;

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
        random_selector:'random_selector',
        writing:'writing',
        template:'template',
        word_translator:'word_translator',
        unseen:'unseen',
        generic_slide:'generic_slide',
        embed_game:'embed_game'
    };


    presentationResetIsInProgress = false;

    apiSubscriptions: any = {
        reset: null
    };

    imageSrc = '';

    data: any[] = [];

    constructor(
        private config: Config,
        private apiService: ApiService,
        public lessonService: LessonService
    ) {
        this.imageSrc = this.config.staticImagePath;
    }

    ngOnInit(): void {
        this.getUser();
        setTimeout(() => {
            this.setSlidesRelativeWidth();
        });
    }

    getUser() {
        this.user = this.config.user;
        this.config.user_subject.subscribe(() => {
            this.user = this.config.user;
        });
    }


    setSlidesRelativeWidth() {
        const map = this.data.map(o => o.slide_type).filter((str) => str !== undefined);
        const all_blanks = map.every( v => v === 'blanks' );
        const all_word_repeater = map.every( v => v === 'word_repeater' );
        const desiredRatio = 9 / 16;
        if(this.slides && this.data.length > 1 && all_word_repeater) {
            const e = this.slides.nativeElement;
            const slidesWidth = e.clientWidth;
            const slidesHeight = e.clientHeight;
            const currentRatio = slidesHeight / slidesWidth;
            if (currentRatio < 1) {
                // width is bigger
                const newWidth = slidesHeight / desiredRatio;
                if (newWidth < slidesWidth) {
                    this.slideWidth = newWidth;
                    this.slideHeight = -1;
                } else {
                    this.slideWidth = -1;
                    this.slideHeight = slidesWidth * desiredRatio;
                }
            } else {
                // height is bigger
                const newHeight = slidesWidth * desiredRatio;
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
            this.data = [this.currentSlide];
        }
    }
    async resetPresentation(reason: string = '') {
        if (this.presentationResetIsInProgress) {
            return;
        }
        this.presentationResetIsInProgress = true;
        this.apiSubscriptions.reset = this.apiService.resetPresentation(this.user.last_logged_platform,{
            app_data: {
                type: reason
            }
        }).subscribe({
            next: (response: any) => {
                this.presentationResetIsInProgress = false;
                this.onResetPresentation.emit(response);
            },
            error: (error) => {
                this.presentationResetIsInProgress = false;
                console.log('resetPresentation error', error);
            }
        });
    }
    speakNative(text:string){
        console.log('speakNative-emit', text);
        this.lessonService.Broadcast('speakNative', {'text':text});
    }

    getSlideToRender(){
        return this.currentSlide.slide_type;
    }

    isSlideToRender(slideType:string){
        const slideToRender = this.getSlideToRender();
        return slideToRender === slideType;
    }

    ngOnChanges(changes: SimpleChanges): void {
        console.log('changes[\'currentSlide\']', changes['currentSlide']);
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
