import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Config} from "../../config";
import {User} from "../../../shared-slides/entities/user";
import {OnStateChangeEvent, PlayerState} from "../../../shared-slides/slides/video/video.component";
import {ApiService} from "../../services/api.service";
import {Router} from "@angular/router";
import {KeyValue} from "@angular/common";

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

    gotUserOnBoarding = false;
    userOnBoarding: any;

    onBoardingDetails: any;

    initDone = false;

    imageSrc: string;

    current_page = 'questions'

    onBoardingObject: any = {
        questions: {
            "Language Proficiency": ["","","","",],
            "IELTS Specifics": ["","","",],
            "Learning Goals and Preferences": ["","","",],
            "Consent and Agreements": ["","",],
        },
        area_of_interest: [

        ],
        be_more_specific: {

        },
        familiar_words: [

        ],
        video_answer: '',
        picture_sentence: '',
        last_page: this.current_page,
        finished: false
    }

    onBoardingObjectChanged = false;

    maxItems: any = {
        area_of_interest: 5,
        familiar_words: 99
    }

    questions: any = {
        "Language Proficiency": [
            "Country of Residence: Which country are you currently residing in?",
            "First Language: What is your first language?",
            "English Proficiency Level: How would you rate your current level of English? (Beginner/Intermediate/Advanced)",
            "Previous English Learning: Have you taken any English language courses or tests before? If yes, please specify.",
        ],
        "IELTS Specifics": [
            "IELTS Test Type: Are you preparing for IELTS Academic or IELTS General Training?",
            "IELTS Experience: Have you taken the IELTS test before? If yes, what was your score?",
            "Target IELTS Score: What is your target IELTS score?",
        ],
        "Learning Goals and Preferences": [
            "Study Goals: What are your main goals for taking the IELTS exam? (e.g., education, immigration, professional certification)",
            "Time Commitment: How much time can you dedicate to IELTS preparation each week?",
            "Areas of Focus: Which areas do you feel you need the most improvement in? (Listening, Reading, Writing, Speaking)",
        ],
        "Consent and Agreements": [
            "Privacy Policy Consent: Do you agree to the website's privacy policy and terms of use?",
            "Newsletter and Updates Subscription: Would you like to subscribe to our newsletter for updates and tips on IELTS preparation?",
        ],
    }

    areaOfInterestItems: any = {
        "Fashion": {image: "https://unseen-audio-files.s3.amazonaws.com/onboarding/fashion.jpg", specific: ['Top Designers', 'Top Models', 'Bar Refaeli', 'Add your own 1', 'Add your own 2']},
        "Sport": {image: "https://unseen-audio-files.s3.amazonaws.com/onboarding/sport.jpg", specific: ['Basketball', 'Michael Jorden', 'Usain Bolt', 'Add your own 1', 'Add your own 2']},
        "Games": {image: "https://unseen-audio-files.s3.amazonaws.com/onboarding/games.jpg", specific: ['Minecraft', 'Call of Duty', 'Quests',  'Add your own 1', 'Add your own 2']},
        "Israel": {image: "https://unseen-audio-files.s3.amazonaws.com/onboarding/israel.jpg", specific: ['Israel-Palastine Conflict', 'Israeli Calture', 'Famous People',  'Add your own 1', 'Add your own 2']},
        "Cars": {image: "https://unseen-audio-files.s3.amazonaws.com/onboarding/cars.jpg", specific: ['Formula I', 'MotoGP', 'Electric Cars',  'Add your own 1', 'Add your own 2']},
        "News": {image: "https://unseen-audio-files.s3.amazonaws.com/onboarding/news.jpg", specific: ['Politics', 'Financial News', 'Crypto',  'Add your own 1', 'Add your own 2']},
        "Shopping": {image: "https://unseen-audio-files.s3.amazonaws.com/onboarding/shopping.jpg", specific: ['Gadgets', 'Top brands', 'Toys',  'Add your own 1', 'Add your own 2']},
        "Science": {image: "https://unseen-audio-files.s3.amazonaws.com/onboarding/science.jpg", specific: ['Physics', 'Astronomy', 'Zoology',  'Add your own 1', 'Add your own 2']},
        "AI": {image: "https://unseen-audio-files.s3.amazonaws.com/onboarding/ai.jpg", specific: ['LLMs', 'Supervised Learning', 'Reinforcment lerarning',  'Add your own 1', 'Add your own 2']},
        "Soccer": {image: "https://unseen-audio-files.s3.amazonaws.com/onboarding/soccer.jpg", specific: ['Ronaldo', 'VAR', 'Manchester City',  'Add your own 1', 'Add your own 2']},
        "Politics": {image: "https://unseen-audio-files.s3.amazonaws.com/onboarding/politics.jpg", specific: ['Benjamin Netany', 'Donald Trump', 'Valdimir Putin',  'Add your own 1', 'Add your own 2']},
        "Social Media": {image: "https://unseen-audio-files.s3.amazonaws.com/onboarding/social_media.jpg", specific: ['Facebook', 'Gen Z', 'Reels',  'Add your own 1', 'Add your own 2']},
        "History": {image: "https://unseen-audio-files.s3.amazonaws.com/onboarding/history.jpg", specific: ['World War 2', 'Holocaust', 'Israel Wars',  'Add your own 1', 'Add your own 2']},
        "Art": {image: "https://unseen-audio-files.s3.amazonaws.com/onboarding/art.jpg", specific: ['Painting Styles', 'Famous sculpture', 'Van Gogh',  'Add your own 1', 'Add your own 2']},
        "Food and Cooking": {image: "https://unseen-audio-files.s3.amazonaws.com/onboarding/food.jpg", specific: ['Special Food', 'Best Resurants', 'Chocolatiers',  'Add your own 1', 'Add your own 2']},
        "Music": {image: "https://unseen-audio-files.s3.amazonaws.com/onboarding/music.jpg", specific: ['Queen', 'Noa Kirel', 'Justin Biber',  'Add your own 1', 'Add your own 2']},
        "Travel": {image: "https://unseen-audio-files.s3.amazonaws.com/onboarding/travel.jpg", specific: ['Highest mountains', 'Beaches', '3rd world countries',  'Add your own 1', 'Add your own 2']},
        "Photography": {image: "https://unseen-audio-files.s3.amazonaws.com/onboarding/photography.jpg", specific: ['Branded Cameras', 'Technology', 'Action cameras',  'Add your own 1', 'Add your own 2']},
        "Computers": {image: "https://unseen-audio-files.s3.amazonaws.com/onboarding/computers.jpg", specific: ['How computer works?', 'History of computers', 'Quantom Computing',  'Add your own 1', 'Add your own 2']},
        "Movies and TV": {image: "https://unseen-audio-files.s3.amazonaws.com/onboarding/tv.jpg", specific: ['IMDB', 'Friends', 'Gal Gadot', 'Add your own 1', 'Add your own 2']}
    }

    beMoreSpecificSelected = 0;

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

    videoAnswers = ['To take them to the party', 'To stop their argument', 'To Play with them', 'To join their dicussion']
    videoDetails: any = {
        id: 'RjpvuPAzJUw',
        start_time: 43,
        end_time: 60,
        height: '',
        width: '',
    }

    image = "https://unseen-audio-files.s3.amazonaws.com/onboarding/noa_kirel.jpg"

    subscribe: any;

    constructor(
        private config: Config,
        private apiService: ApiService,
        private router: Router
    ) {
        this.imageSrc = this.config.staticImagePath;
    }

    ngOnInit(): void {
        this.user = this.config.user;
        this.config.user_subject.subscribe((user) => {
            this.user = user;
        });
        this.subscribe = this.config.user_on_boarding_subject.subscribe((userOnBoarding: any) => {
            this.setupOnBoarding(userOnBoarding)
            if (this.subscribe) {
                this.subscribe.unsubscribe();
            }
        });
        if (this.config.user_on_boarding) {
            this.setupOnBoarding(this.config.user_on_boarding)
        }
    }

    setupOnBoarding(userOnBoarding: any) {
        this.validateUserOnboarding(userOnBoarding)
        this.gotUserOnBoarding = true;
        console.log('this.gotUserOnBoarding', userOnBoarding)
        this.initCurrentPage(false);
        setTimeout(() => {
            this.setUpYoutubeVideo();
        })
    }

    validateUserOnboarding(userOnBoarding: any) {
        let needReset = true;
        // checking questions
        if (!userOnBoarding.questions
            || !userOnBoarding.questions["Language Proficiency"].length
            || !userOnBoarding.questions["IELTS Specifics"].length
            || !userOnBoarding.questions["Learning Goals and Preferences"].length
            || !userOnBoarding.questions["Consent and Agreements"].length) {
            needReset = true;
        }
        // checking area of interest
        const keys = Object.keys(this.areaOfInterestItems)
        if (!userOnBoarding.area_of_interest.every((item: string) => keys.includes(item))) {
            needReset = true;
        }

        // checking familiar words
        if (!userOnBoarding.familiar_words.every((item: string) => this.familiarWords.includes(item))) {
            needReset = true;
        }

        // checking video answer
        if (userOnBoarding.video_answer && this.videoAnswers.indexOf(userOnBoarding.video_answer) === -1) {
            needReset = true;
        }
        if (!needReset) {
            this.userOnBoarding = userOnBoarding;
        }
    }

    ngAfterViewInit(): void {
        // this.setUpYoutubeVideo();
    }

    setUpYoutubeVideo() {
        if (this.video) {
            this.loading_player = true;
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            this.video.nativeElement.appendChild(tag);
            this.setVideoHeight();
        }
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
        } else {
            this.setUpObject(this.userOnBoarding);
        }
        this.initExtraDetails();
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
                } else if (typeof obj[item] === 'boolean') {
                    this.onBoardingObject[item] = obj[item]
                }
            }
        }
        console.log('this.onBoardingObject', this.onBoardingObject)
    }

    initExtraDetails() {
        this.current_page = this.onBoardingObject.last_page;

        for (let item in this.onBoardingObject.be_more_specific) {
            this.beMoreSpecificSelected += this.onBoardingObject.be_more_specific[item].length;
        }
        console.log('this.beMoreSpecificSelected', this.beMoreSpecificSelected)
    }

    selectInterest(itemText: any) {
        this.onBoardingObjectChanged = true;
        this.onBoardingObject.finished = false;
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
        this.onBoardingObjectChanged = true;
        this.onBoardingObject.finished = false;
        const specificForItem = this.onBoardingObject.be_more_specific[item.key];
        console.log('specificForItem', specificForItem)
        const index = specificForItem.indexOf(specificItem)
        if (index > -1) {
            this.onBoardingObject.be_more_specific[item.key].splice(index, 1);
            this.beMoreSpecificSelected--;
        } else {
            this.onBoardingObject.be_more_specific[item.key].push(specificItem)
            this.beMoreSpecificSelected++;
            // if (this.onBoardingObject.area_of_interest.length == this.maxItems.area_of_interest) {
            // }
        }
    }

    selectFamiliarWords(itemText: any) {
        this.onBoardingObjectChanged = true;
        this.onBoardingObject.finished = false;
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

    onQuestionChange(key: string, index: number, e: any) {
        if (this.onBoardingObject.questions[key]) {
            this.onBoardingObject.questions[key][index] = e.target.value;
        }
    }

    originalOrder = (a: KeyValue<number,string>, b: KeyValue<number,string>): number => {
        return 0;
    }

    showQuestionsNextButton() {
        let show = true;
        for (let key in this.onBoardingObject.questions) {
            for (let i in this.onBoardingObject.questions[key]) {
                if (!this.onBoardingObject.questions[key][i]) {
                    show = false;
                    break;
                }
            }
        }
        return show;
    }

    onQuestionsChange() {
        this.onBoardingObjectChanged = true;
    }

    selectVideoAnswer(itemText: any) {
        this.onBoardingObjectChanged = true;
        this.onBoardingObject.finished = false;
        this.onBoardingObject.video_answer = itemText;
    }

    onChangePictureSentence() {
        this.onBoardingObjectChanged = true;
        this.onBoardingObject.finished = false;
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
        this.onBoardingObject.last_page = page;
        this.saveUserDetails();
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

    saveUserDetails(redirect=false) {
        if (this.onBoardingObjectChanged) {
            this.onBoardingObjectChanged = false;
            // this.user.on_boarding_details = {...this.onBoardingObject}
            this.apiService.saveUserOnBoarding(this.user.last_logged_platform, {'on_boarding_object': this.onBoardingObject}).subscribe({
                next: async (response: any) => {
                    console.log('response', response)
                    // const clientRunningOnServerHost = this.config.server_host === window.location.origin + '/';
                    // if (!clientRunningOnServerHost) {
                    //     // only when running localhost 4200
                    //     let user = this.config.getCookie('user', true)
                    //     if(user) {
                    //         user = JSON.parse(user)
                    //         user.on_boarding_details = this.onBoardingObject;
                    //         const user_exp = this.config.getCookie('user-exp', true)
                    //         const d = new Date(user_exp)
                    //         this.config.setCookie('user', JSON.stringify(user), d, true);
                    //         this.config.user = user;
                    //     }
                    // }
                    this.config.user_on_boarding = {...this.onBoardingObject};
                    if (redirect) {
                        console.log('redirect', redirect)
                        this.router.navigate(['/' + this.user.last_logged_platform + '/dashboard'])
                    }
                },
                error: (error) => {
                    console.log('saveUserDetails error', error)
                },
            })
        } else {
            if (redirect) {
                this.router.navigate(['/dashboard'])
            }
        }
    }

    onFinish() {
        this.onBoardingObjectChanged = true;
        this.onBoardingObject.finished = true;
        console.log('finish this.onBoardingObject', this.onBoardingObject)
        this.saveUserDetails(true);
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
        this.onBoardingObject.be_more_specific = {};
        this.beMoreSpecificSelected = 0;
    }

    getString(text: any) {
        return String(text)
    }

    onPlayerReady(e: any) {
        // this.loading_player = false;
        console.log('onPlayerReady e', e)
    }

    onPlayerStateChange(e: OnStateChangeEvent) {
        // console.log('YouTube event: ', e)
        // console.log('YouTube event target - current time : ', e.target.getCurrentTime())
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
