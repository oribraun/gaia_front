import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Config} from "../../config";
import {User} from "../../../shared/entities/user";
import {OnStateChangeEvent, PlayerState} from "../../../shared/slides/video/video.component";
import {ApiService} from "../../services/api.service";
import {Router} from "@angular/router";
import {KeyValue} from "@angular/common";

declare let $: any;
@Component({
    selector: 'app-on-boarding',
    templateUrl: './on-boarding.component.html',
    styleUrls: ['./on-boarding.component.less']
})
export class OnBoardingComponent implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild('video', { static: false }) video!: ElementRef;
    loading_player = false;

    user!: User;

    gotUserOnBoarding = false;
    userOnBoarding: any;

    onBoardingDetails: any;

    initDone = false;

    imageSrc: string;

    current_page = 'questions';

    onBoardingObject: any = {
        questions: {
            "Language Proficiency": ["", "", "", ""],
            "IELTS Specifics": ["", "", ""],
            "Learning Goals and Preferences": ["", "", "", []],
            "Consent and Agreements": ["", ""]
        },
        area_of_interest: [

        ],
        be_more_specific: {

        },
        be_more_specific_custom: {

        },
        familiar_words: [

        ],
        video_answer: '',
        picture_sentence: '',
        last_page: this.current_page,
        finished: false
    };

    onBoardingObjectChanged = false;

    maxItems: any = {
        area_of_interest: 5,
        familiar_words: 99
    };

    countries = [ "Afghanistan", "Åland Islands", "Albania", "Algeria", "American Samoa", "Andorra", "Angola", "Anguilla", "Antarctica", "Antigua and Barbuda", "Argentina", "Armenia", "Aruba", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bermuda", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Bouvet Island", "Brazil", "British Indian Ocean Territory", "Brunei Darussalam", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde", "Cayman Islands", "Central African Republic", "Chad", "Chile", "China", "Christmas Island", "Cocos (Keeling) Islands", "Colombia", "Comoros", "Congo", "Congo, The Democratic Republic of The", "Cook Islands", "Costa Rica", "Cote D'ivoire", "Croatia", "Cuba", "Curaçao", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Falkland Islands (Malvinas)", "Faroe Islands", "Fiji", "Finland", "France", "French Guiana", "French Polynesia", "French Southern Territories", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Gibraltar", "Greece", "Greenland", "Grenada", "Guadeloupe", "Guam", "Guatemala", "Guernsey", "Guinea", "Guinea-bissau", "Guyana", "Haiti", "Heard Island and Mcdonald Islands", "Holy See (Vatican City State)", "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iran, Islamic Republic of", "Iraq", "Ireland", "Isle of Man", "Israel", "Italy", "Jamaica", "Japan", "Jersey", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea, Democratic People's Republic of", "Korea, Republic of", "Kuwait", "Kyrgyzstan", "Lao People's Democratic Republic", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libyan Arab Jamahiriya", "Liechtenstein", "Lithuania", "Luxembourg", "Macao", "Macedonia, The Former Yugoslav Republic of", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Martinique", "Mauritania", "Mauritius", "Mayotte", "Mexico", "Micronesia, Federated States of", "Moldova, Republic of", "Monaco", "Mongolia", "Montenegro", "Montserrat", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Caledonia", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Niue", "Norfolk Island", "Northern Mariana Islands", "Norway", "Oman", "Pakistan", "Palau", "Palestinian Territory, Occupied", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Pitcairn", "Poland", "Portugal", "Puerto Rico", "Qatar", "Reunion", "Romania", "Russia", "Rwanda", "Saint Helena", "Saint Kitts and Nevis", "Saint Lucia", "Saint Pierre and Miquelon", "Saint Vincent and The Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Georgia and The South Sandwich Islands", "Spain", "Sri Lanka", "Sudan", "Suriname", "Svalbard and Jan Mayen", "Eswatini", "Sweden", "Switzerland", "Syrian Arab Republic", "Taiwan (ROC)", "Tajikistan", "Tanzania, United Republic of", "Thailand", "Timor-leste", "Togo", "Tokelau", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Turks and Caicos Islands", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "United States Minor Outlying Islands", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Virgin Islands, British", "Virgin Islands, U.S.", "Wallis and Futuna", "Western Sahara", "Yemen", "Zambia", "Zimbabwe" ];
    languages = [ "Brazilian Portuguese", "Canadian French", "English", "French Creole", "Haitian Creole", "Navajo", "Quechua", "Spanish", "Catalan", "Danish", "Dutch", "Faroese", "Finnish", "Flemish", "French", "German", "Greek", "Icelandic", "Italian", "Norwegian", "Portuguese", "Spanish", "Swedish", "UK English / British English", "Belarusian", "Bosnian", "Bulgarian", "Croatian", "Czech", "Estonian", "Hungarian", "Latvian", "Lithuanian", "Macedonian", "Polish", "Romanian", "Russian", "Serbian", "Slovak", "Slovenian", "Turkish", "Ukrainian", "Amharic (Ethiopia)", "Dinka (Sudan)", "Ibo (Nigeria)", "Kirundi", "Mandinka", "Nuer (Nilo-Saharan)", "Oromo (Ethiopia)", "Kinyarwanda", "Shona (Zimbabwe)", "Somali", "Swahili", "Tigrigna (Ethiopia)", "Wolof", "Xhosa", "Yoruba", "Zulu", "Arabic", "Dari", "Farsi", "Hebrew", "Kurdish", "Pashtu", "Punjabi", "Urdu (Pakistan)", "Armenian", "Azerbaijani", "Georgian", "Kazakh", "Mongolian", "Turkmen", "Uzbek", "Bengali", "Cham", "Chamorro (Guam)", "Gujarati (India)", "Hindi", "Indonesian", "Khmer (Cambodia)", "Kmhmu (Laos)", "Korean", "Laotian", "Malayalam", "Malay", "Marathi (India", "Marshallese", "Nepali", "Sherpa", "Tamil", "Thai", "Tibetan", "Trukese (Micronesia)", "Vietnamese", "Amoy", "Burmese", "Cantonese", "Chinese", "Chinese–Simplified", "Chinese–Traditional", "Chiu Chow", "Chow Jo", "Fukienese", "Hakka (China)", "Hmong", "Hainanese", "Japanese", "Mandarin", "Mien", "Shanghainese", "Taiwanese", "Taishanese", "Fijian", "Palauan", "Samoan", "Tongan", "Bikol", "Cebuano", "Ilocano", "Ilongo", "Pampangan", "Pangasinan", "Tagalog", "Visayan" ];

    questions: any = { // type could be type = input, radio, checkbox, select-box, options = [''],
        "Language Proficiency": [
            {text: "Country of Residence: Which country are you currently residing in?", type: 'select-box', options: this.countries, required: true},
            {text: "First Language: What is your first language?", type: 'select-box', options: this.languages, required: true},
            {text: "English Proficiency Level: How would you rate your current level of English?", type: 'radio', options: ['Beginner', 'Intermediate', 'Advanced'], required: true},
            {text: "Previous English Learning: Have you taken any English language courses or tests before? If yes, please specify.", type: 'input'}
        ],
        "IELTS Specifics": [
            {text: "IELTS Test Type: Are you preparing for IELTS Academic or IELTS General Training?", type: 'radio', options: ['IELTS Academic', 'IELTS General']},
            {text: "IELTS Experience: Have you taken the IELTS test before? If yes, what was your score?", type: 'input'},
            {text: "Target IELTS Score: What is your target IELTS score?", type: 'input'}
        ],
        "Learning Goals and Preferences": [
            {text: "Study Goals: What are your main goals for taking the IELTS exam?", type: 'radio', options: ['education', 'professional', 'certification']},
            {text: "Time Commitment: How much time can you dedicate to IELTS preparation each week?", type: 'radio', options: ['daily', 'once a week', 'twice a week', '3-4 times a week']},
            {text: "What is The Exact Date Of your exam?", type: 'date'},
            {text: "Areas of Focus: Which areas do you feel you need the most improvement in?", type: 'checkbox', options: ["Listening", "Reading", "Writing", "Speaking"]}
        ],
        "Consent and Agreements": [
            {text: "Privacy Policy Consent: Do you agree to the website's <a id='privacy-policy' class='pointer'>privacy policy</a> and terms of use?", type: 'radio-switch', options: ['Yes'], required: true, accepted_val: true},
            {text: "Newsletter and Updates Subscription: Would you like to subscribe to our newsletter for updates and tips on IELTS preparation?", type: 'radio-switch', options: ['Yes']}
        ]
    };
    questions_required_errors: any = {
        "Language Proficiency": [false, false, false, false],
        "IELTS Specifics": [false, false, false],
        "Learning Goals and Preferences": [false, false, false, false],
        "Consent and Agreements": [false, false, false]
    };

    areaOfInterestItems: any = {
        "Fashion": {image: "https://unseen-audio-files.s3.amazonaws.com/onboarding/fashion.jpg", specific: ['Top Designers', 'Top Models', 'Bar Refaeli'], custom: ['', '']},
        "Sport": {image: "https://unseen-audio-files.s3.amazonaws.com/onboarding/sport.jpg", specific: ['Basketball', 'Michael Jorden', 'Usain Bolt'], custom: ['', '']},
        "Games": {image: "https://unseen-audio-files.s3.amazonaws.com/onboarding/games.jpg", specific: ['Minecraft', 'Call of Duty', 'Quests'], custom: ['', '']},
        "Israel": {image: "https://unseen-audio-files.s3.amazonaws.com/onboarding/israel.jpg", specific: ['Israel-Palastine Conflict', 'Israeli Calture', 'Famous People'], custom: ['', '']},
        "Cars": {image: "https://unseen-audio-files.s3.amazonaws.com/onboarding/cars.jpg", specific: ['Formula I', 'MotoGP', 'Electric Cars'], custom: ['', '']},
        "News": {image: "https://unseen-audio-files.s3.amazonaws.com/onboarding/news.jpg", specific: ['Politics', 'Financial News', 'Crypto'], custom: ['', '']},
        "Investments": {image: "https://unseen-audio-files.s3.amazonaws.com/onboarding/shopping.jpg", specific: ['Trading', 'Venture Capital', 'Startups'], custom: ['', '']},
        "Science": {image: "https://unseen-audio-files.s3.amazonaws.com/onboarding/science.jpg", specific: ['Physics', 'Astronomy', 'Zoology'], custom: ['', '']},
        "AI": {image: "https://unseen-audio-files.s3.amazonaws.com/onboarding/ai.jpg", specific: ['LLMs', 'Supervised Learning', 'Reinforcment lerarning'], custom: ['', '']},
        "Soccer": {image: "https://unseen-audio-files.s3.amazonaws.com/onboarding/soccer.jpg", specific: ['Ronaldo', 'VAR', 'Manchester City'], custom: ['', '']},
        "Politics": {image: "https://unseen-audio-files.s3.amazonaws.com/onboarding/politics.jpg", specific: ['Benjamin Netany', 'Donald Trump', 'Valdimir Putin'], custom: ['', '']},
        "Social Media": {image: "https://unseen-audio-files.s3.amazonaws.com/onboarding/social_media.jpg", specific: ['Facebook', 'Gen Z', 'Reels'], custom: ['', '']},
        "History": {image: "https://unseen-audio-files.s3.amazonaws.com/onboarding/history.jpg", specific: ['World War 2', 'Holocaust', 'Israel Wars'], custom: ['', '']},
        "Art": {image: "https://unseen-audio-files.s3.amazonaws.com/onboarding/art.jpg", specific: ['Painting Styles', 'Famous sculpture', 'Van Gogh'], custom: ['', '']},
        "Food and Cooking": {image: "https://unseen-audio-files.s3.amazonaws.com/onboarding/food.jpg", specific: ['Special Food', 'Best Resurants', 'Chocolatiers'], custom: ['', '']},
        "Music": {image: "https://unseen-audio-files.s3.amazonaws.com/onboarding/music.jpg", specific: ['Queen', 'Noa Kirel', 'Justin Biber'], custom: ['', '']},
        "Travel": {image: "https://unseen-audio-files.s3.amazonaws.com/onboarding/travel.jpg", specific: ['Highest mountains', 'Beaches', '3rd world countries'], custom: ['', '']},
        "Photography": {image: "https://unseen-audio-files.s3.amazonaws.com/onboarding/photography.jpg", specific: ['Branded Cameras', 'Technology', 'Action cameras'], custom: ['', '']},
        "Computers": {image: "https://unseen-audio-files.s3.amazonaws.com/onboarding/computers.jpg", specific: ['How computer works?', 'History of computers', 'Quantom Computing'], custom: ['', '']},
        "Movies and TV": {image: "https://unseen-audio-files.s3.amazonaws.com/onboarding/tv.jpg", specific: ['IMDB', 'Friends', 'Gal Gadot'], custom: ['', '']}
    };

    beMoreSpecificSelected = 0;
    beMoreSpecificCustomSelected: any = {};

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
        'Surreptitious'
    ];

    videoAnswers = ['To take them to the party', 'To stop their argument', 'To Play with them', 'To join their dicussion'];
    videoDetails: any = {
        id: 'RjpvuPAzJUw',
        start_time: 43,
        end_time: 60,
        height: '',
        width: ''
    };

    image = "https://unseen-audio-files.s3.amazonaws.com/onboarding/noa_kirel.jpg";

    subscribe: any;

    constructor(
        private config: Config,
        private apiService: ApiService,
        private router: Router
    ) {
        this.imageSrc = this.config.staticImagePath;
    }

    privacyPolicyClick(e: any) {
        e.preventDefault();
        this.showPrivacyPolicyModel();
    }
    showPrivacyPolicyModel() {
        $('#privacyPolicyModal').modal('show');
    }

    hidePrivacyPolicyModel() {
        const el = $('#privacyPolicyModal');
        el.removeClass('show');
        el.modal('hide');
        $('.modal-backdrop').hide();
    }

    ngOnInit(): void {
        this.user = this.config.user;
        this.config.user_subject.subscribe((user) => {
            this.user = user;
        });
        this.subscribe = this.config.user_on_boarding_subject.subscribe((userOnBoarding: any) => {
            this.setupOnBoarding(userOnBoarding);
            if (this.subscribe) {
                this.subscribe.unsubscribe();
            }
        });
        if (this.config.user_on_boarding) {
            this.setupOnBoarding(this.config.user_on_boarding);
        }
    }

    setupOnBoarding(userOnBoarding: any) {
        if (userOnBoarding) {
            this.validateUserOnboarding(userOnBoarding);
            console.log('this.gotUserOnBoarding', userOnBoarding);
        }
        this.gotUserOnBoarding = true;
        this.initCurrentPage(false);
        setTimeout(() => {
            this.setUpYoutubeVideo();
        });
    }

    validateUserOnboarding(userOnBoarding: any) {
        let needReset = false;
        // checking questions
        if (!userOnBoarding.questions
            || !userOnBoarding.questions["Language Proficiency"].length
            || !userOnBoarding.questions["IELTS Specifics"].length
            || !userOnBoarding.questions["Learning Goals and Preferences"].length
            || !userOnBoarding.questions["Consent and Agreements"].length) {
            needReset = true;
        }
        const equalTypes1 = this.areArraysEqualInType(this.onBoardingObject.questions["Language Proficiency"], userOnBoarding.questions["Language Proficiency"]);
        const equalTypes2 = this.areArraysEqualInType(this.onBoardingObject.questions["IELTS Specifics"], userOnBoarding.questions["IELTS Specifics"]);
        const equalTypes3 = this.areArraysEqualInType(this.onBoardingObject.questions["Learning Goals and Preferences"], userOnBoarding.questions["Learning Goals and Preferences"]);
        const equalTypes4 = this.areArraysEqualInType(this.onBoardingObject.questions["Consent and Agreements"], userOnBoarding.questions["Consent and Agreements"]);
        // console.log('equalTypes1', equalTypes1)
        // console.log('equalTypes2', equalTypes2)
        // console.log('equalTypes3', equalTypes3)
        // console.log('equalTypes4', equalTypes4)
        if (!equalTypes1 || !equalTypes2 || !equalTypes3 || !equalTypes4) {
            needReset = true;
        }
        // checking area of interest
        const keys = Object.keys(this.areaOfInterestItems);
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

    areArraysEqualInType(arr1: any[], arr2: any[]) {
        // Check if arrays have the same length
        if (arr1.length !== arr2.length || !arr1 || !arr2) {
            return false;
        }

        // Iterate through the arrays and compare types
        for (let i = 0; i < arr1.length; i++) {
            // Use typeof to get the type of the element
            const type1 = typeof arr1[i];
            const type2 = typeof arr2[i];

            // Compare types
            if (type1 !== type2) {
                return false;
            }

            // If the element is an array, recursively check its elements
            if (type1 === 'object' && Array.isArray(arr1[i]) && Array.isArray(arr2[i])) {
                if (!this.areArraysEqualInType(arr1[i], arr2[i])) {
                    return false;
                }
            }
        }

        // If all types are equal, return true
        return true;
    }

    ngAfterViewInit(): void {
        const n = 0;
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
        });
    }

    listenToPrivacyPolicyClick() {
        setTimeout(() => {
            const ele = $('#privacy-policy');
            if (ele) {
                ele.on('click', (e: any) => {
                    this.privacyPolicyClick(e);
                });
            }
        });
    }

    setUpDateMin() {
        setTimeout(() => {
            const elements = $('input[type="date"]');
            if (elements && elements.length) {
                const ele = elements[0];
                const now = new Date();
                const minDate = now.toISOString().substring(0, 10);
                ele.setAttribute('min', minDate);
            }
        });
    }



    initCurrentPage(demo = false) {
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
            };
            this.setUpObject(obj);
        } else {
            this.setUpObject(this.userOnBoarding);
        }
        this.initExtraDetails();
    }

    setUpObject(obj: any) {
        for (const item in obj) {
            if (this.onBoardingObject.hasOwnProperty(item)) {
                if (Array.isArray(obj[item]) && obj[item].length > 0) {
                    this.onBoardingObject[item] = obj[item];
                } else if (typeof obj[item] === 'object' && Object.keys(obj[item]).length > 0) {
                    this.onBoardingObject[item] = obj[item];
                } else if (typeof obj[item] === 'string' && obj[item].length > 0) {
                    this.onBoardingObject[item] = obj[item];
                } else if (typeof obj[item] === 'boolean') {
                    this.onBoardingObject[item] = obj[item];
                }
            }
        }
        if (this.onBoardingObject.last_page === 'questions') {
            this.listenToPrivacyPolicyClick();
            this.setUpDateMin();
        }
        console.log('this.onBoardingObject', this.onBoardingObject);
    }

    initExtraDetails() {
        this.current_page = this.onBoardingObject.last_page;

        for (const i in this.onBoardingObject.be_more_specific) {
            this.beMoreSpecificSelected += this.onBoardingObject.be_more_specific[i].length;
        }
        for (const i in this.onBoardingObject.be_more_specific_custom) {
            this.beMoreSpecificSelected += this.onBoardingObject.be_more_specific_custom[i].filter((o:string) => o).length;
        }
        console.log('this.beMoreSpecificSelected', this.beMoreSpecificSelected);
    }

    selectInterest(itemText: any) {
        this.onBoardingObjectChanged = true;
        this.onBoardingObject.finished = false;
        const index = this.onBoardingObject.area_of_interest.indexOf(itemText);
        if (index > -1) {
            this.onBoardingObject.area_of_interest.splice(index, 1);
        } else {
            if (this.onBoardingObject.area_of_interest.length < this.maxItems.area_of_interest) {
                this.onBoardingObject.area_of_interest.push(itemText);
            } else {
                this.onBoardingObject.area_of_interest.splice(0, 1);
                this.onBoardingObject.area_of_interest.push(itemText);
            }
            // if (this.onBoardingObject.area_of_interest.length == this.maxItems.area_of_interest) {
            // }
        }
        this.resetBeMoreSpecific();
    }

    selectBeMoreSpecific(item: any, specificItem: string) {
        this.onBoardingObjectChanged = true;
        this.onBoardingObject.finished = false;
        const specificForItem = this.onBoardingObject.be_more_specific[item.key];
        const index = specificForItem.indexOf(specificItem);
        if (index > -1) {
            this.onBoardingObject.be_more_specific[item.key].splice(index, 1);
            this.beMoreSpecificSelected--;
        } else {
            this.onBoardingObject.be_more_specific[item.key].push(specificItem);
            this.beMoreSpecificSelected++;
            // if (this.onBoardingObject.area_of_interest.length == this.maxItems.area_of_interest) {
            // }
        }
    }

    inputBeMoreSpecific(item: any, e: any) {
        const value = e.target.value;
        console.log('value', value);
        return;
    }

    selectFamiliarWords(itemText: any) {
        this.onBoardingObjectChanged = true;
        this.onBoardingObject.finished = false;
        const index = this.onBoardingObject.familiar_words.indexOf(itemText);
        if (index > -1) {
            this.onBoardingObject.familiar_words.splice(index, 1);
        } else {
            if (this.onBoardingObject.familiar_words.length < this.maxItems.familiar_words) {
                this.onBoardingObject.familiar_words.push(itemText);
            } else {
                this.onBoardingObject.familiar_words.splice(0, 1);
                this.onBoardingObject.familiar_words.push(itemText);
            }
            // if (this.onBoardingObject.familiar_words.length == this.maxItems.familiar_words) {
            // }
        }
    }

    onQuestionChange(key: string, index: number, e: any) {
        if (this.onBoardingObject.questions[key]) {
            this.onBoardingObject.questions[key][index] = e.target.value;
        }
    }

    originalOrder = (a: KeyValue<number, string>, b: KeyValue<number, string>): number => {
        return 0;
    };

    showQuestionsNextButton() {
        let show = true;
        for (const key in this.onBoardingObject.questions) {
            for (const i in this.onBoardingObject.questions[key]) {
                if (!this.onBoardingObject.questions[key][i]) {
                    show = false;
                    break;
                }
            }
        }
        return show;
    }

    onQuestionsNextButton(next_page: string) {
        let proceed = true;
        for (const key in this.onBoardingObject.questions) {
            for (const i in this.onBoardingObject.questions[key]) {
                if (this.questions[key][i].required) {
                    if (Array.isArray(this.onBoardingObject.questions[key][i]) && !this.onBoardingObject.questions[key][i].length) {
                        proceed = false;
                        this.questions_required_errors[key][i] = true;
                    } else if (typeof this.onBoardingObject.questions[key][i] === 'string' && !this.onBoardingObject.questions[key][i]) {
                        proceed = false;
                        this.questions_required_errors[key][i] = true;
                    } else {
                        this.questions_required_errors[key][i] = false;
                    }
                } else {
                    this.questions_required_errors[key][i] = false;
                }
            }
        }
        console.log('this.questions_required_errors', this.questions_required_errors);
        if (proceed) {
            this.goToNextPage(next_page);
        }
    }

    onQuestionsChange() {
        this.onBoardingObjectChanged = true;
        this.onBoardingObject.finished = false;
    }

    onCustomBeMoreSpecific(key: string, i: number) {
        this.onQuestionsChange();
        if(this.onBoardingObject.be_more_specific_custom[key][i]) {
            if (!this.beMoreSpecificCustomSelected[key]) {
                this.beMoreSpecificCustomSelected[key] = {};
            }
            if(!this.beMoreSpecificCustomSelected[key][i]) {
                this.beMoreSpecificCustomSelected[key][i] = true;
                this.beMoreSpecificSelected++;
            }
        } else {
            this.beMoreSpecificSelected--;
        }
        // this.beMoreSpecificSelected++;
    }

    onQuestionCheckboxChanged(key: string, index: number, value: string) {
        const valIndex = this.onBoardingObject.questions[key][index].indexOf(value);
        if (valIndex > -1) {
            this.onBoardingObject.questions[key][index].splice(valIndex, 1);
        } else {
            this.onBoardingObject.questions[key][index].push(value);
        }
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
        const ele = $('#onBoardingCarousel');
        if (ele && ele.carousel) {
            ele.carousel('next');
        }
    }
    onSwipeRight() {
        const ele = $('#onBoardingCarousel');
        if (ele && ele.carousel) {
            ele.carousel('prev');
        }
    }

    goToNextPage(page: string) {
        this.scrollToTop();
        // this.current_page = page;
        if (page === 'be_more_specific') {
            if (this.onBoardingObjectChanged) {
                this.setUpBeMoreSpecific();
            }
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
        if (page === 'questions') {
            this.listenToPrivacyPolicyClick();
            this.setUpDateMin();
        }
        if (page === 'video_answer') {
            this.setVideoHeight();
        }
        this.onSwipeRight();
    }

    scrollToTop() {
        const ele = $('#onBoardingCarousel');
        ele.stop().animate({ scrollTop: 0 }, 50);
    }

    saveUserDetails(redirect = false) {
        if (this.onBoardingObjectChanged) {
            this.onBoardingObjectChanged = false;
            // this.user.on_boarding_details = {...this.onBoardingObject}
            this.apiService.saveUserOnBoarding(this.user.last_logged_platform, {'on_boarding_object': this.onBoardingObject}).subscribe({
                next: async (response: any) => {
                    console.log('response', response);
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
                    //         this.config.user = new User(user);
                    //     }
                    // }
                    this.config.user_on_boarding = {...this.onBoardingObject};
                    if (redirect) {
                        console.log('redirect', redirect);
                        this.router.navigate(['/' + this.user.last_logged_platform + '/dashboard']);
                    }
                },
                error: (error) => {
                    console.log('saveUserDetails error', error);
                }
            });
        } else {
            if (redirect) {
                this.router.navigate(['/dashboard']);
            }
        }
    }

    onFinish() {
        this.onBoardingObjectChanged = true;
        this.onBoardingObject.finished = true;
        console.log('finish this.onBoardingObject', this.onBoardingObject);
        this.saveUserDetails(true);
    }

    setUpBeMoreSpecific() {
        // if (this.current_page === 'be_more_specific') {
        this.resetBeMoreSpecific();
        for (const item of this.onBoardingObject.area_of_interest) {
            this.onBoardingObject.be_more_specific[item] = [];
            if (!this.onBoardingObject.be_more_specific_custom[item]) {
                this.onBoardingObject.be_more_specific_custom[item] = this.areaOfInterestItems[item].custom.slice(0);
            }
        }
        // }
    }

    resetBeMoreSpecific() {
        this.onBoardingObject.be_more_specific = {};
        this.beMoreSpecificSelected = 0;
        this.onBoardingObject.be_more_specific_custom = {};
        this.beMoreSpecificCustomSelected = {};
    }

    getString(text: any) {
        return String(text);
    }

    onPlayerReady(e: any) {
        // this.loading_player = false;
        console.log('onPlayerReady e', e);
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

    ngOnDestroy(): void {
        this.hidePrivacyPolicyModel();
    }


}
