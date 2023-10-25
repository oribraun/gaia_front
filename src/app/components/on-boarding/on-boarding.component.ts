import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Config} from "../../config";
import {User} from "../../entities/user";
import {OnStateChangeEvent, PlayerState} from "../lesson/slides/video/video.component";

declare var $: any;
@Component({
    selector: 'app-on-boarding',
    templateUrl: './on-boarding.component.html',
    styleUrls: ['./on-boarding.component.less']
})
export class OnBoardingComponent implements OnInit, AfterViewInit {

    @ViewChild('video', { static: false }) video!: ElementRef;
    loading_player = false;

    user!: User;

    initDone = false;

    imageSrc: string;

    onBoardingObject: any = {
        area_of_interest: [

        ],
        be_more_specific: {

        },
        familiar_words: [

        ],
        video_answer: '',
        picture_sentence: '',
        finished: false
    }

    maxItems: any = {
        area_of_interest: 5,
        familiar_words: 99
    }

    current_page = 'area_of_interest'

    areaOfInterestItems: any = {
        "Fashion": {image: "assets/images/lesson/lesson_placeholder.jpg", specific: ['First', 'Second', 'Third', 'Fourth', 'Five']},
        "Sport": {image: "assets/images/lesson/lesson_placeholder.jpg", specific: ['First', 'Second', 'Third', 'Fourth', 'Five']},
        "Games": {image: "assets/images/lesson/lesson_placeholder.jpg", specific: ['First', 'Second', 'Third', 'Fourth', 'Five']},
        "Israel": {image: "assets/images/lesson/lesson_placeholder.jpg", specific: ['First', 'Second', 'Third', 'Fourth', 'Five']},
        "Cars": {image: "assets/images/lesson/lesson_placeholder.jpg", specific: ['First', 'Second', 'Third', 'Fourth', 'Five']},
        "News": {image: "assets/images/lesson/lesson_placeholder.jpg", specific: ['First', 'Second', 'Third', 'Fourth', 'Five']},
        "Shopping": {image: "assets/images/lesson/lesson_placeholder.jpg", specific: ['First', 'Second', 'Third', 'Fourth', 'Five']},
        "Science": {image: "assets/images/lesson/lesson_placeholder.jpg", specific: ['First', 'Second', 'Third', 'Fourth', 'Five']},
        "AI": {image: "assets/images/lesson/lesson_placeholder.jpg", specific: ['First', 'Second', 'Third', 'Fourth', 'Five']},
        "Soccer": {image: "assets/images/lesson/lesson_placeholder.jpg", specific: ['First', 'Second', 'Third', 'Fourth', 'Five']},
        "Politics": {image: "assets/images/lesson/lesson_placeholder.jpg", specific: ['First', 'Second', 'Third', 'Fourth', 'Five']},
        "Social Network": {image: "assets/images/lesson/lesson_placeholder.jpg", specific: ['First', 'Second', 'Third', 'Fourth', 'Five']},
        "History": {image: "assets/images/lesson/lesson_placeholder.jpg", specific: ['First', 'Second', 'Third', 'Fourth', 'Five']},
        "Art": {image: "assets/images/lesson/lesson_placeholder.jpg", specific: ['First', 'Second', 'Third', 'Fourth', 'Five']},
        "Food and Cooking": {image: "assets/images/lesson/lesson_placeholder.jpg", specific: ['First', 'Second', 'Third', 'Fourth', 'Five']},
        "Music": {image: "assets/images/lesson/lesson_placeholder.jpg", specific: ['First', 'Second', 'Third', 'Fourth', 'Five']},
        "Travel": {image: "assets/images/lesson/lesson_placeholder.jpg", specific: ['First', 'Second', 'Third', 'Fourth', 'Five']},
        "Photography": {image: "assets/images/lesson/lesson_placeholder.jpg", specific: ['First', 'Second', 'Third', 'Fourth', 'Five']},
        "Computers": {image: "assets/images/lesson/lesson_placeholder.jpg", specific: ['First', 'Second', 'Third', 'Fourth', 'Five']},
        "Movies and TV": {image: "assets/images/lesson/lesson_placeholder.jpg", specific: ['First', 'Second', 'Third', 'Fourth', 'Five']}
    }

    familiarWords = [
        'Cat',
        'Run',
        'Jump',
        'Happy',
        'Dog',
        'Family',
        'Sunshine',
        'Delicious',
        'Adventure',
        'Fascinating',
        'Efficiency',
        'Spectacular',
        'Resilience',
        'Sustainable',
        'Imagination',
        'Beautiful',
        'Meticulous',
        'pernicious',
        'Concentration',
        'Surreptitious',
    ]

    videoAnswers = ['Coffee', 'Nothing', 'To Play', 'To complain']
    videoDetails: any = {
        id: 'tQ5IPGritIo',
        start_time: -1,
        end_time: -1,
        height: '',
        width: '',
    }

    image = "assets/images/lesson/lesson_placeholder.jpg"

    constructor(
        private config: Config
    ) {
        this.imageSrc = this.config.staticImagePath;
    }

    ngOnInit(): void {
        this.user = this.config.user;
        this.config.user_subject.subscribe((user) => {
            this.user = user;
        });
        this.initCurrentPage(false);
    }

    ngAfterViewInit(): void {
        this.loading_player = true;
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        this.video.nativeElement.appendChild(tag);
        this.setVideoHeight();
    }

    setVideoHeight() {
        setTimeout(() => {
            this.videoDetails.height = this.video.nativeElement.offsetHeight;
            this.videoDetails.width = this.video.nativeElement.clientWidth;
        })
    }



    initCurrentPage(demo= false) {
        if (demo) {
            const obj: any = {
                "area_of_interest": [
                    "Food and Cooking",
                    "Games",
                    "History",
                    "Israel",
                    "Movies and TV"
                ],
                "be_more_specific": {
                    "Food and Cooking": [
                        "First"
                    ],
                    "Games": [],
                    "History": [
                        "Fourth"
                    ],
                    "Israel": [],
                    "Movies and TV": []
                },
                "familiar_words": ['Resilience', 'Fascinating'],
                // "video_answer": "To Play",
                // "picture_sentence": "To Play",
                "finished": false
            }
            this.setUpObject(obj);
            this.findLastPage();
        } else {
            this.setUpObject(this.user.on_boarding_details);
            this.findLastPage();
        }
    }

    setUpObject(obj: any) {
        for (let item in obj) {
            if (this.onBoardingObject.hasOwnProperty(item)) {
                if (Array.isArray(obj[item]) && obj[item].length > 0) {
                    this.onBoardingObject[item] = obj[item]
                } else if (typeof obj[item] === 'object' && Object.keys(obj[item]).length > 0) {
                    this.onBoardingObject[item] = obj[item]
                } else if (typeof obj[item] === 'string' && obj[item].length > 0) {
                    this.onBoardingObject[item] = obj[item]
                }
            }
        }
        console.log('this.onBoardingObject', this.onBoardingObject)
    }

    findLastPage() {
        let lastPage = ''
        for (let item in this.onBoardingObject) {
            if (Object.keys(this.onBoardingObject[item]).length > 0) {
                lastPage = item
            }
        }
        if (lastPage) {
            this.current_page = lastPage;
        }
    }

    selectInterest(itemText: any) {
        const index = this.onBoardingObject.area_of_interest.indexOf(itemText)
        if (index > -1) {
            this.onBoardingObject.area_of_interest.splice(index, 1);
        } else {
            if (this.onBoardingObject.area_of_interest.length < this.maxItems.area_of_interest) {
                this.onBoardingObject.area_of_interest.push(itemText)
            } else {
                this.onBoardingObject.area_of_interest.splice(0, 1);
                this.onBoardingObject.area_of_interest.push(itemText)
            }
            if (this.onBoardingObject.area_of_interest.length == this.maxItems.area_of_interest) {
            }
        }
        this.resetBeMoreSpecific();
    }

    selectBeMoreSpecific(item: any, specificItem: string) {
        const specificForItem = this.onBoardingObject.be_more_specific[item.key];
        console.log('specificForItem', specificForItem)
        const index = specificForItem.indexOf(specificItem)
        if (index > -1) {
            this.onBoardingObject.be_more_specific[item.key].splice(index, 1);
        } else {
            this.onBoardingObject.be_more_specific[item.key].push(specificItem)
            // if (this.onBoardingObject.area_of_interest.length == this.maxItems.area_of_interest) {
            // }
        }
    }

    selectFamiliarWords(itemText: any) {
        const index = this.onBoardingObject.familiar_words.indexOf(itemText)
        if (index > -1) {
            this.onBoardingObject.familiar_words.splice(index, 1);
        } else {
            if (this.onBoardingObject.familiar_words.length < this.maxItems.familiar_words) {
                this.onBoardingObject.familiar_words.push(itemText)
            } else {
                this.onBoardingObject.familiar_words.splice(0, 1);
                this.onBoardingObject.familiar_words.push(itemText)
            }
            if (this.onBoardingObject.familiar_words.length == this.maxItems.familiar_words) {
            }
        }
    }

    selectVideoAnswer(itemText: any) {
        this.onBoardingObject.video_answer = itemText;
    }

    onSwipeLeft() {
        const ele = $('#onBoardingCarousel')
        if (ele && ele.carousel) {
            ele.carousel('next')
        }
    }
    onSwipeRight() {
        const ele = $('#onBoardingCarousel')
        if (ele && ele.carousel) {
            ele.carousel('prev')
        }
    }

    goToNextPage(page: string) {
        this.scrollToTop();
        // this.current_page = page;
        if (page === 'be_more_specific') {
            this.setUpBeMoreSpecific();
        }
        if (page === 'video_answer') {
            this.setVideoHeight();
        }
        this.onSwipeLeft();
        // console.log('this.onBoardingObject', this.onBoardingObject)
    }

    goToPrevPage(page: string) {
        this.scrollToTop();
        // this.current_page = page;
        if (page === 'video_answer') {
            this.setVideoHeight();
        }
        this.onSwipeRight();
    }

    scrollToTop() {
        const ele = $('#onBoardingCarousel');
        ele.stop().animate({ scrollTop: 0 }, 50);
    }

    onFinish() {
        console.log('finish this.onBoardingObject', this.onBoardingObject)
    }

    setUpBeMoreSpecific() {
        // if (this.current_page === 'be_more_specific') {
        this.resetBeMoreSpecific();
        for (let item of this.onBoardingObject.area_of_interest) {
            this.onBoardingObject.be_more_specific[item] = []
        }
        // }
    }

    resetBeMoreSpecific() {
        this.onBoardingObject.be_more_specific = {}
    }

    getString(text: any) {
        return String(text)
    }

     onPlayerReady(e: any) {
        // this.loading_player = false;
        console.log('onPlayerReady e', e)
    }

    onPlayerStateChange(e: OnStateChangeEvent) {
        console.log('YouTube event: ', e)
        console.log('YouTube event target - current time : ', e.target.getCurrentTime())
        // this.currentState = e.data;
        // clearTimeout(this.currentStateTimeout);
        // this.currentStateTimeout = setTimeout(() => {
        //     const data: any = {"source": "video_player"}
        //     if (e.data == PlayerState.ENDED) {
        //         this.currentState = PlayerState.ENDED;
        //         console.log('video ended')
        //         data['video_event'] = "ended";
        //         data['noToggle'] = true;
        //         this.lessonService.Broadcast("endDoNotDisturb", data)
        //         this.lessonService.Broadcast("slideEventRequest", data)
        //     }
        //     if (e.data == PlayerState.PAUSED) {
        //         this.currentState = PlayerState.PAUSED;
        //         console.log('video paused')
        //         data['video_event'] = "paused";
        //         data['noToggle'] = true;
        //         this.lessonService.Broadcast("endDoNotDisturb", data)
        //         this.lessonService.Broadcast("slideEventRequest", data)
        //     }
        //     if (e.data == PlayerState.PLAYING) {
        //         this.currentState = PlayerState.PLAYING;
        //         console.log('video playing')
        //         data['video_event'] = "playing";
        //         this.lessonService.Broadcast("DoNotDisturb", data)
        //     }
        // }, this.stateTimeout)
    }
}
