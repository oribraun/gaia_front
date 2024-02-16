import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ApiService} from "../../../main/services/api.service";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {AlertService} from "../../../main/services/alert.service";

declare const $: any;

@Component({
    selector: 'app-lessons-edit',
    templateUrl: './lessons-edit.component.html',
    styleUrl: './lessons-edit.component.less',
    animations: [
        trigger('openClose', [
            state('open', style({
                height: '*',
                // padding: '10px',
                opacity: 1
            })),
            state('closed', style({
                height: '0',
                paddingTop: '0',
                paddingBottom: '0',
                opacity: 0
            })),
            transition('* => closed', [
                animate('.3s')
            ]),
            transition('* => open', [
                animate('.3s')
            ])
        ])
    ]
})
export class LessonsEditComponent implements OnInit {

    question_options = [
        "multiple_choice",
        "open_question",
        "sentence_completion"
    ];

    multiple_choice = {
        "hints": {
            "quotes": "The debate over who is the better football player, Cristiano Ronaldo or Lionel Messi",
            "guidance": "To answer this question, you need to identify the main focus or subject of the text. In this case, the main topic is the debate between Cristiano Ronaldo and Lionel Messi, specifically about who is the better football player. Look for keywords or phrases that indicate this topic, such as 'The debate over', 'who is the better football player', and the names Ronaldo and Messi. Pay attention to the introduction and conclusion of the text, as they often provide clues about the main topic.",
            "correct_answer": "The debate over who is the better football player, Cristiano Ronaldo or Lionel Messi"
        },
        "level": 1,
        "question": {
            "answers": [
                {
                    "answer": "The debate over who is the better football player",
                    "is_correct": true
                },
                {
                    "answer": "The achievements of Cristiano Ronaldo",
                    "is_correct": false
                },
                {
                    "answer": "The achievements of Lionel Messi",
                    "is_correct": false
                },
                {
                    "answer": "The history of football",
                    "is_correct": false
                }
            ],
            "question": "What is the main topic of the text?"
        },
        "question_id": 8,
        "question_type": "multiple_choice",
        "n_correct_answers": 1
    };
    open_question = {
        "hints": {
            "quotes": "Supporters of Ronaldo argue that his physical attributes, such as his strength, speed, and aerial ability, make him a more complete player.",
            "guidance": "To answer this question, you need to focus on the arguments made by Ronaldo's supporters. Look for the section where they discuss his physical attributes and what they believe sets him apart from Messi. Pay attention to the specific attributes mentioned, such as strength, speed, and aerial ability.",
            "correct_answer": "strength, speed, and aerial ability"
        },
        "level": 1,
        "question": "What are the physical attributes that Ronaldo's supporters argue make him a more complete player?",
        "question_id": 0,
        "question_type": "open_question"
    };
    sentence_completion = {
        "hints": {
            "quotes": "Supporters of Ronaldo argue that his physical attributes, such as his strength, speed, and aerial ability, make him a more complete player.",
            "guidance": "To answer this question, you need to look for the arguments made by Ronaldo's supporters. In this case, they argue that his physical attributes make him a more complete player. Look for a sentence that mentions Ronaldo's attributes and how they contribute to his overall ability as a player.",
            "correct_answer": "physical attributes"
        },
        "level": 2,
        "question": "Supporters of Ronaldo argue that his ________ make him a more complete player.",
        "question_id": 5,
        "question_type": "sentence_completion"
    };

    writing = {
        "text": "You should spend about 20 minutes on this task.\n\nThe table below presents various data points related to five major cryptocurrencies over two quarters in 2023.\nThe data includes market capitalization, percentage change in value, and volume of transactions.\nSummarize the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
        "practice": "The IELTS task I",
        "slide_uid": "1dasdsfsdhg323",
        "essay_type": "data analysis",
        "image_path": "https://gaia-public-files.s3.amazonaws.com/writing/writing_table_data_crypto.png",
        "slide_type": "writing",
        "load_fields": [],
        "slide_title": "Writing Task I: Academic\n\nCrypto-currency - a data analysis",
        "save_identifier": "analysis",
        "time_in_minutes": 20,
        "min_number_of_words": 150
    };
    reading = {
        "slide_uid": "2a9ccc3b-fce8-4d1d-a98e-ca88da6fcc45",
        "slide_type": "unseen",
        "text_level": 5,
        "slide_title": "The Ronaldo vs Messi Debate",
        "unseen_text": "I   The debate over who is the better football player, Cristiano Ronaldo or Lionel Messi, has been a topic of discussion among football fans for years. Both players have achieved incredible success and have numerous records to their names. However, the question of who is truly the best remains unanswered.\n\nII  Supporters of Ronaldo argue that his physical attributes, such as his strength, speed, and aerial ability, make him a more complete player. They point to his goal-scoring record, which is unmatched by any other player in the history of the sport. Ronaldo has won multiple Ballon d'Or awards, which are given to the best player in the world, further solidifying his claim to greatness.\n\nIII On the other hand, Messi's supporters believe that his technical skills and natural talent set him apart from Ronaldo. Messi's dribbling ability, close control of the ball, and vision on the field are often praised as unmatched. He has also won multiple Ballon d'Or awards and has broken numerous records throughout his career.\n\nIV  The debate between Ronaldo and Messi is not just about individual achievements, but also about playing style and team success. Ronaldo has had success at multiple clubs, including Manchester United, Real Madrid, and Juventus, winning numerous league titles and Champions League trophies. Messi, on the other hand, has spent his entire career at Barcelona, where he has won numerous league titles and Champions League trophies as well.\n\nV   Despite the arguments and statistics, the question of who is better, Ronaldo or Messi, is subjective and will never be definitively answered. Football is a sport that is influenced by personal preferences and opinions. Each player has their own unique style and strengths, making it impossible to determine a clear winner.\n\nVI  Ultimately, the Ronaldo vs Messi debate is a testament to the greatness of both players. They have pushed each other to new heights and have provided football fans with countless memorable moments. Whether you support Ronaldo or Messi, there is no denying that they are two of the greatest players to have ever graced the game.",
        "all_questions": []
    };

    hearing = {
        "slide_uid": "1dsafdsfuh",
        "audio_path": "/static/lesson_media/listening/ElevenLabs_2023-11-06T16_29_10_Charlie_pre_s50_sb75_m1_The_Impact_of_COVID-19_on_Children.mp3",
        "slide_type": "hearing",
        "text_level": 3,
        "slide_title": "The Impact of COVID-19 on Children",
        "unseen_text": "I   The COVID-19 pandemic has had a significant impact on children around the world. From disruptions in education to emotional and mental health challenges, children have faced numerous difficulties during this unprecedented time. II  One of the major effects of the pandemic on children has been the disruption of their education. With schools closing and the shift to online learning, many children have struggled to adapt to this new mode of education. Lack of access to technology and internet connectivity has further widened the educational gap, particularly for children from disadvantaged backgrounds. III  The social and emotional well-being of children has also been greatly affected by the pandemic. The isolation and lack of social interaction have led to increased feelings of loneliness, anxiety, and depression among children. The closure of recreational facilities and cancellation of extracurricular activities have further limited their opportunities for socialization and personal growth. IV  Additionally, the pandemic has had a detrimental impact on the physical health of children. With restrictions on outdoor activities and limited access to sports facilities, children have become more sedentary, leading to an increase in childhood obesity and related health issues. V   The economic consequences of the pandemic have also affected children and their families. Many parents have lost their jobs or experienced financial instability, which has resulted in food insecurity and inadequate access to healthcare for children. The stress and uncertainty surrounding the economic situation have further added to the emotional burden on children. VI  In order to mitigate the negative impact of the pandemic on children, it is crucial to prioritize their well-being and provide necessary support. This includes ensuring access to quality education, promoting mental health services, and addressing the economic challenges faced by families. By investing in the future of our children, we can help them overcome the adversities caused by the pandemic and build a brighter tomorrow.",
        "all_questions": []
    };
    speaking = {
        "slide_type": "speaking",
        "slide_uid": "c4bc4666-f9b5-46ac-9137-bdacdea46979",
        "slide_title": "Part I: Interview Questions",
        "all_questions": []
    };

    video = {
        "text": "Hi. I'm Gaia. \n\nThis session serves as an introductory guide to the reading part of the exam.\n\nIt's important to understand what's included. The exam features three separate texts, each resembling the type of writing you'd find in college. These texts aren't necessarily excerpts from academic textbooks; they could also be articles from newspapers or magazines.\n\nThe phrase college level refers to the complexity and sophistication of the language used, suitable for college-educated readers. It mirrors the standard you would typically encounter in your college studies. Expect a variety of subjects and formats in the reading material, but all will maintain a consistent, advanced level of writing.\n\n",
        "responses": {
            "what is your name": "my name is Gaia",
            "can I skip this video and start practicing": ""
        },
        "slide_uid": "2a9ccc3b-fce8-4d1d-a98e-ca46",
        "slide_type": "video",
        "slide_title": "Reading Overview",
        "video_content": "explanation about reading section of the ielts exam",
        "video_details": {
            "srt": "https://unseen-audio-files.s3.amazonaws.com/videos/Reading+Overview-caption.srt",
            "url": "https://unseen-audio-files.s3.amazonaws.com/videos/Reading+Overview.mp4",
            "end_time": -1,
            "start_time": -1
        },
        "video_purpose": "explanation about reading section of the ielts exam"
    };

    cardTypes = [
        "BROWSE_LIST",
        "BROWSE_ONEBYONE",
        "PRACTICE_INPUT",
        "PRACTICE_AUDIO_INPUT",
        "PRACTICE_MULTIPLE_CHOICE"
    ];

    card = {
        "text": "תרגם",
        "cards": [
            {
                "a": "To Practice",
                "b": "לתרגל",
                "id": 0,
                "a_image_path": "",
                "b_image_path": "",
                "wrong_values": []
            },
            {
                "a": "To Shit",
                "b": "לחרבן",
                "id": 1,
                "a_image_path": "",
                "b_image_path": "",
                "wrong_values": [
                    "לדבר",
                    "לצעוק",
                    "אף תשובה לא נכונה"
                ]
            },
            {
                "a": "To kill",
                "b": "להרוג",
                "id": 2,
                "a_image_path": "",
                "b_image_path": "",
                "wrong_values": []
            },
            {
                "a": "To Fuck",
                "b": "לזיין",
                "id": 3,
                "a_image_path": "",
                "b_image_path": "",
                "wrong_values": []
            }
        ],
        "shuffle": true,
        "slide_uid": "2a9ccc3b-fce8-4d1d-a98e-ca88da6fcc45",
        "cards_type": "BROWSE_LIST",
        "slide_type": "cards",
        "slide_title": "Verbs",
        "enable_audio": true,
        "show_envelope": true
    };
    card_base = {
        "a": "To Practice",
        "b": "לתרגל",
        "id": 0,
        "a_image_path": "",
        "b_image_path": "",
        "wrong_values": []
    };

    lesson_base: any = {
        uuid: "",
        lesson_group_type_id: "",
        title: "",
        description: "",
        total_slides: -1,
        presentation_data: {
            "presentation_title": "",
            "presentation_topic": "",
            "presentation_lang": "en",
            "presentation_lesson_data": {
                "sections": [
                    {
                        "section_uid": 1,
                        "section_title": "not relevant",
                        "section_topic": "not relevant",
                        "slides": []
                    }
                ]
            }
        },
        presentation_data_version: -1,
        metadata: {}
    };
    kit_base: any = {
        uuid: "",
        title: "",
        description: "",
        direction: "ltr",
        parts: []
    };

    part_base: any = {
        "title": "",
        "lessons": [] // id, title
    };


    currentTab = 'lessons';

    // for lessons
    @ViewChild('searchInput') searchInput: ElementRef;
    textAreaRows = 5;
    showSearchSuggestions = false;
    searchTimeout: any;
    slides_options: any = [];
    lessons: any[] = [];
    gettingAdminLessons = false;
    currentLesson: any;
    currentLessonIndex: any;
    new_lessons: any[] = [];
    lastLessonDeleted: any;
    expendManagement: any = {};

    // for kits
    @ViewChild('kitSearchInput') kitSearchInput: ElementRef;
    showKitSearchSuggestions = false;
    showKitLessonSearchSuggestions: any = {};
    KitLessonSearchFocused: any = {};
    kits: any[] = [];
    gettingAdminKits = false;
    searchKitTimeout: any;
    lastKitDeleted: any;
    currentKit: any;
    currentKitIndex: any;
    new_kits: any[] = [];

    constructor(
        private apiService: ApiService,
        private alertService: AlertService
    ) {
    }

    ngOnInit(): void {
        this.getLessonGroupTypes();
    }

    getLessonGroupTypes() {
        this.apiService.getLessonGroupTypes({}).subscribe({
            next: (response: any) => {
                if (response.err) {
                    console.log('getLessonGroupTypes err', response);
                } else {
                    console.log('response', response);
                    this.slides_options = response.group_types;
                    const exclude_slide_types = ["test"];
                    this.slides_options = this.slides_options.filter((o: any) => exclude_slide_types.indexOf(o.value) === -1);
                }
            },
            error: (error) => {
                console.log('getLessonGroupTypes error', error);
            }
        });
    }

    addLesson() {
        const base = this.cloneObject(this.lesson_base);
        this.new_lessons.push(base);
        this.selectLesson(this.new_lessons.length - 1);
        this.printLessons();
    }

    selectLesson(index: number) {
        this.currentLessonIndex = index;
        this.currentLesson = this.new_lessons[this.currentLessonIndex];
        this.resetExpend();
    }

    removeLesson(index: number) {
        this.lastLessonDeleted = {index: index, lesson: this.cloneObject(this.new_lessons[index])};
        if (index === this.currentLessonIndex) {
            if (index !== this.new_lessons.length - 1) {
                this.selectLesson(index + 1);
            } else if (index === this.new_lessons.length - 1) {
                this.selectLesson(index - 1);
            }
        }
        this.new_lessons.splice(index, 1);
        this.fixIndexOnDelete(index);
    }

    saveNewLessons() {
        console.log('this.currentLesson', this.currentLesson);
    }

    undoLastLessonDelete() {
        if (this.lastLessonDeleted) {
            const index = this.lastLessonDeleted.index;
            const lesson = this.lastLessonDeleted.lesson;
            this.new_lessons.splice(index, 0, lesson);
            this.lastLessonDeleted = null;
            this.fixIndexOnUndo(index);
        }
    }

    fixIndexOnDelete(index: number) {
        if (index <= this.currentLessonIndex) {
            this.currentLessonIndex--;
        }
    }
    fixIndexOnUndo(index: number) {
        if (index <= this.currentLessonIndex) {
            this.currentLessonIndex++;
        }
    }

    addSlide(lesson_index: number, slide_type_id: string) {
        const ids = this.slides_options.map((o: any) => o.key);
        const i = ids.indexOf(parseInt(slide_type_id));
        if (i > -1) {
            const group_type:  keyof LessonsEditComponent = this.slides_options[i].value;
            const obj = this.cloneObject(this[group_type]);
            this.currentLesson.presentation_data.presentation_lesson_data.sections[0].slides.push(obj);
            this.printLessons();
        }
    }

    removeSlide(lesson_index: number, slide_index: number) {
        this.currentLesson.presentation_data.presentation_lesson_data.sections[0].slides.splice(slide_index, 1);
    }

    addSlideQuestion(lesson_index: number, slide_index: number, question_html_id:  string) {
        const question_type: any = $('#' + question_html_id).val();
        const i = this.question_options.indexOf(question_type);
        if (i > -1) {
            const group_type:  keyof LessonsEditComponent = question_type;
            const obj = this.cloneObject(this[group_type]);
            this.currentLesson.presentation_data.presentation_lesson_data.sections[0].slides[slide_index].all_questions.push(obj);
            this.printLessons();
        }
    }

    removeSlideQuestion(lesson_index: number, slide_index: number, question_index: number) {
        this.currentLesson.presentation_data.presentation_lesson_data.sections[0].slides[slide_index].all_questions.splice(question_index, 1);
    }

    addSlideMultipleQuestionAnswer(lesson_index: number, slide_index: number, question_index: number) {
        const obj = {
            "answer": "",
            "is_correct": false
        };
        this.currentLesson.presentation_data.presentation_lesson_data.sections[0].slides[slide_index].all_questions[question_index].question.answers.push(obj);
        this.printLessons();
    }

    removeSlideMultipleQuestionAnswer(lesson_index: number, slide_index: number, question_index: number, question_answer_index: number) {
        this.currentLesson.presentation_data.presentation_lesson_data.sections[0].slides[slide_index].all_questions[question_index].question.answers.splice(question_answer_index, 1);
    }

    addSlideCard(lesson_index: number, slide_index: number) {
        const obj = this.cloneObject(this.card_base);
        this.currentLesson.presentation_data.presentation_lesson_data.sections[0].slides[slide_index].cards.push(obj);
    }

    removeSlideCard(lesson_index: number, slide_index: number, card_index: number) {
        this.currentLesson.presentation_data.presentation_lesson_data.sections[0].slides[slide_index].cards.splice(card_index, 1);
    }

    printLessons() {
        console.log('this.new_lessons', this.new_lessons);
        console.log('this.currentLesson', this.currentLesson);
    }

    collapse(lesson_index: number = -1, slide_index: number = -1, question_index: number = -1) {
        if (lesson_index > -1 && slide_index === -1 && question_index === -1) {
            this.expendManagement[lesson_index] = false;
        }
        if (lesson_index > -1 && slide_index > -1 && question_index === -1) {
            this.expendManagement[lesson_index + '_' + slide_index] = false;
        }
        if (lesson_index > -1 && slide_index > -1 && question_index > -1) {
            this.expendManagement[lesson_index + '_' + slide_index + '_' + question_index] = false;
        }
    }

    collapseAll(lesson_index: number = -1, slide_index: number = -1, question_index: number = -1) {
        if (lesson_index > -1 && slide_index === -1 && question_index === -1) {
            for (let i = 0; i < this.currentLesson.presentation_data.presentation_lesson_data.sections[0].slides.length; i++) {
                this.expendManagement[lesson_index + '_' + i] = false;
            }
        }
        if (lesson_index > -1 && slide_index > -1 && question_index === -1) {
            for (let i = 0; i < this.currentLesson.presentation_data.presentation_lesson_data.sections[0].slides[slide_index].all_questions.length; i++) {
                this.expendManagement[lesson_index + '_' + slide_index + '_' + i] = false;
            }
        }
    }
    expendAll(lesson_index: number = -1, slide_index: number = -1, question_index: number = -1) {
        if (lesson_index > -1 && slide_index === -1 && question_index === -1) {
            for (let i = 0; i < this.currentLesson.presentation_data.presentation_lesson_data.sections[0].slides.length; i++) {
                this.expendManagement[lesson_index + '_' + i] = true;
            }
        }
        if (lesson_index > -1 && slide_index > -1 && question_index === -1) {
            for (let i = 0; i < this.currentLesson.presentation_data.presentation_lesson_data.sections[0].slides[slide_index].all_questions.length; i++) {
                this.expendManagement[lesson_index + '_' + slide_index + '_' + i] = true;
            }
        }
    }

    expend(lesson_index: number = -1, slide_index: number = -1, question_index: number = -1) {
        if (lesson_index > -1 && slide_index === -1 && question_index === -1) {
            if (!this.expendManagement[lesson_index]) {
                this.expendManagement[lesson_index] = true;
            }
        }
        if (lesson_index > -1 && slide_index > -1 && question_index === -1) {
            if (!this.expendManagement[lesson_index + '_' + slide_index]) {
                this.expendManagement[lesson_index + '_' + slide_index] = true;
            }
        }
        if (lesson_index > -1 && slide_index > -1 && question_index > -1) {
            if (!this.expendManagement[lesson_index + '_' + slide_index + '_' + question_index]) {
                this.expendManagement[lesson_index + '_' + slide_index + '_' + question_index] = true;
            }
        }
    }

    // moveDownLesson(index: number) {
    //     if (index < this.lessons.length - 1) {
    //         const lesson = this.lessons[index];
    //         this.lessons.splice(index, 1);
    //         this.lessons.splice(index + 1, 0, lesson);
    //     }
    // }
    //
    // moveUpLesson(index: number) {
    //     if (index > 0) {
    //         const lesson = this.lessons[index];
    //         this.lessons.splice(index, 1);
    //         this.lessons.splice(index - 1, 0, lesson);
    //     }
    //
    // }

    moveDownSlide(lesson_index: number, index: number) {
        if (index < this.currentLesson.presentation_data.presentation_lesson_data.sections[0].slides.length - 1) {
            if (this.expendManagement[lesson_index + '_' + (index + 1)] !== this.expendManagement[lesson_index + '_' + index]) {
                this.expendManagement[lesson_index + '_' + (index + 1)] = !this.expendManagement[lesson_index + '_' + (index + 1)];
                this.expendManagement[lesson_index + '_' + index] = !this.expendManagement[lesson_index + '_' + index];
            }
            const newArray = [...this.currentLesson.presentation_data.presentation_lesson_data.sections[0].slides];

            const lesson = newArray[index];
            newArray.splice(index, 1);
            newArray.splice(index + 1, 0, lesson);
            this.currentLesson.presentation_data.presentation_lesson_data.sections[0].slides = newArray;
        }
    }

    moveUpSlide(lesson_index: number, index: number) {
        if (index > 0) {
            if (this.expendManagement[lesson_index + '_' + (index - 1)] !== this.expendManagement[lesson_index + '_' + index]) {
                this.expendManagement[lesson_index + '_' + (index - 1)] = !this.expendManagement[lesson_index + '_' + (index - 1)];
                this.expendManagement[lesson_index + '_' + index] = !this.expendManagement[lesson_index + '_' + index];
            }
            const newArray = [...this.currentLesson.presentation_data.presentation_lesson_data.sections[0].slides];

            const lesson = newArray[index];
            newArray.splice(index, 1);
            newArray.splice(index - 1, 0, lesson);
            this.currentLesson.presentation_data.presentation_lesson_data.sections[0].slides = newArray;
        }

    }

    moveDownQuestion(slide_index: number, index: number) {
        if (index < this.currentLesson.presentation_data.presentation_lesson_data.sections[0].slides[slide_index].all_questions.length - 1) {
            const lesson = this.currentLesson.presentation_data.presentation_lesson_data.sections[0].slides[slide_index].all_questions[index];
            this.currentLesson.presentation_data.presentation_lesson_data.sections[0].slides[slide_index].all_questions.splice(index, 1);
            this.currentLesson.presentation_data.presentation_lesson_data.sections[0].slides[slide_index].all_questions.splice(index + 1, 0, lesson);
        }
    }

    moveUpQuestion(slide_index: number, index: number) {
        if (index > 0) {
            const lesson = this.currentLesson.presentation_data.presentation_lesson_data.sections[0].slides[slide_index].all_questions[index];
            this.currentLesson.presentation_data.presentation_lesson_data.sections[0].slides[slide_index].all_questions.splice(index, 1);
            this.currentLesson.presentation_data.presentation_lesson_data.sections[0].slides[slide_index].all_questions.splice(index - 1, 0, lesson);
        }
    }

    onChangeTab(tab: string) {
        this.currentTab = tab;
        this.lastLessonDeleted = null;
        this.currentLessonIndex = null;
        this.currentLesson = null;
        if (this.searchInput.nativeElement) {
            this.searchInput.nativeElement.value = "";
        }
    }

    searchLessons($event: any) {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.getAdminLessons($event.target.value);
        }, 500);
    }

    getAdminLessons(searchValue: string) {
        if (this.gettingAdminLessons) {
            return;
        }
        this.gettingAdminLessons = true;
        this.apiService.getAdminLessons({searchValue: searchValue}).subscribe({
            next: (response: any) => {
                if (response.err) {
                    console.log('getAdminLessons err', response);
                } else {
                    console.log('response', response);
                    this.lessons = response.lessons;
                }
                this.gettingAdminLessons = false;
            },
            error: (error) => {
                console.log('getAdminLessons error', error);
                this.gettingAdminLessons = false;
            }
        });
    }

    saveAdminLesson() {
        if (this.gettingAdminLessons) {
            return;
        }
        this.gettingAdminLessons = true;
        this.apiService.saveAdminLesson({lesson: this.currentLesson}).subscribe({
            next: (response: any) => {
                if (response.err) {
                    this.alertService.error(response.errMessage, false, -1);
                    console.log('saveAdminLesson err', response);
                } else {
                    console.log('response', response);
                    if (this.currentLesson.id) {
                        const idsMap = this.lessons.map((o: any) => o.id);
                        const index = idsMap.indexOf(this.currentLesson.id);
                        if (index > -1) {
                            this.lessons[index] = this.cloneObject(this.currentLesson);
                        }
                        this.alertService.success('saved successfully');
                    } else {
                        this.new_lessons.splice(this.currentLessonIndex, 1);
                        this.currentLessonIndex--;
                        if (this.new_lessons[this.currentLessonIndex]) {
                            this.currentLesson = this.new_lessons[this.currentLessonIndex];
                        } else if (this.new_lessons[0]) {
                            this.currentLesson = this.new_lessons[0];
                        } else {
                            this.currentLesson = null;
                            this.currentLessonIndex = null;
                        }
                        this.alertService.success('saved successfully, you can search for it.');
                    }
                }
                this.gettingAdminLessons = false;
            },
            error: (error) => {
                console.log('saveAdminLesson error', error);
                this.gettingAdminLessons = false;
            }
        });
    }

    deleteAdminLesson() {
        if (this.gettingAdminLessons) {
            return;
        }
        this.gettingAdminLessons = true;
        this.apiService.deleteAdminLesson({lesson_id: this.currentLesson.id}).subscribe({
            next: (response: any) => {
                if (response.err) {
                    this.alertService.error(response.errMessage, false, -1);
                    console.log('deleteAdminLesson err', response);
                } else {
                    if (this.currentLesson.id) {
                        const idsMap = this.lessons.map((o: any) => o.id);
                        const index = idsMap.indexOf(this.currentLesson.id);
                        if (this.searchInput.nativeElement.value === this.currentLesson.title) {
                            this.searchInput.nativeElement.value = "";
                        }
                        if (index > -1) {
                            this.lessons.splice(index, 1);
                        }
                        this.currentLesson = null;
                    }
                    this.alertService.success('deleted successfully');
                }
                this.gettingAdminLessons = false;
            },
            error: (error) => {
                console.log('deleteAdminLesson error', error);
                this.gettingAdminLessons = false;
            }
        });
    }

    editLesson(lesson: any) {
        this.currentLesson = this.cloneObject(lesson);
        this.currentLessonIndex = null;
        this.hideDrop();
        if (this.searchInput.nativeElement) {
            this.searchInput.nativeElement.value = this.currentLesson.title;
        }
        this.resetExpend();
    }


    searchKits($event: any) {
        clearTimeout(this.searchKitTimeout);
        this.searchKitTimeout = setTimeout(() => {
            this.getAdminKits($event.target.value);
        }, 500);
    }

    getAdminKits(searchValue: string) {
        if (this.gettingAdminKits) {
            return;
        }
        this.gettingAdminKits = true;
        this.apiService.getAdminKits({searchValue: searchValue}).subscribe({
            next: (response: any) => {
                if (response.err) {
                    console.log('getAdminKits err', response);
                } else {
                    console.log('response', response);
                    this.kits = response.kits;
                }
                this.gettingAdminKits = false;
            },
            error: (error) => {
                console.log('getAdminKits error', error);
                this.gettingAdminKits = false;
            }
        });
    }

    saveAdminKit() {
        if (this.gettingAdminKits) {
            return;
        }
        this.gettingAdminKits = true;
        this.apiService.saveAdminKit({kit: this.currentKit}).subscribe({
            next: (response: any) => {
                if (response.err) {
                    this.alertService.error(response.errMessage, false, -1);
                    console.log('saveAdminKit err', response);
                } else {
                    console.log('response', response);
                    if (this.currentKit.id) {
                        const idsMap = this.kits.map((o: any) => o.id);
                        const index = idsMap.indexOf(this.currentKit.id);
                        if (index > -1) {
                            this.kits[index] = this.cloneObject(this.currentKit);
                        }
                        this.alertService.success('saved successfully');
                    } else {
                        this.new_kits.splice(this.currentKitIndex, 1);
                        this.currentKitIndex--;
                        if (this.new_kits[this.currentKitIndex]) {
                            this.currentKit = this.new_kits[this.currentKitIndex];
                        } else if (this.new_kits[0]) {
                            this.currentKit = this.new_kits[0];
                        } else {
                            this.currentKit = null;
                            this.currentKitIndex = null;
                        }
                        this.alertService.success('saved successfully, you can search for it.');
                    }
                }
                this.gettingAdminKits = false;
            },
            error: (error) => {
                console.log('saveAdminKit error', error);
                this.gettingAdminKits = false;
            }
        });
    }

    deleteAdminKit() {
        if (this.gettingAdminKits) {
            return;
        }
        this.gettingAdminKits = true;
        this.apiService.deleteAdminKit({kit_id: this.currentKit.id}).subscribe({
            next: (response: any) => {
                if (response.err) {
                    this.alertService.error(response.errMessage, false, -1);
                    console.log('deleteAdminKit err', response);
                } else {
                    if (this.currentKit.id) {
                        const idsMap = this.kits.map((o: any) => o.id);
                        const index = idsMap.indexOf(this.currentKit.id);
                        if (this.kitSearchInput.nativeElement.value === this.currentKit.title) {
                            this.kitSearchInput.nativeElement.value = "";
                        }
                        if (index > -1) {
                            this.kits.splice(index, 1);
                        }
                        this.currentKit = null;
                    }
                    this.alertService.success('deleted successfully');
                }
                this.gettingAdminKits = false;
            },
            error: (error) => {
                console.log('deleteAdminKit error', error);
                this.gettingAdminKits = false;
            }
        });
    }

    generateAdminKitLink() {
        if (this.gettingAdminKits) {
            return;
        }
        this.gettingAdminKits = true;
        this.apiService.generateAdminKitLink({kit_id: this.currentKit.id}).subscribe({
            next: (response: any) => {
                if (response.err) {
                    this.alertService.error(response.errMessage, false, -1);
                    console.log('generateAdminKitLink err', response);
                } else {
                    console.log('response', response);
                    const full_link = this.apiService.serverBase + response.kit_link;
                    this.alertService.success('generated successfully<br>' + full_link, false, -1);
                }
                this.gettingAdminKits = false;
            },
            error: (error) => {
                console.log('generateAdminKitLink error', error);
                this.gettingAdminKits = false;
            }
        });
    }

    editKit(kit: any) {
        this.currentKit = this.cloneObject(kit);
        this.currentKitIndex = null;
        this.hideKitDrop();
        if (this.kitSearchInput.nativeElement) {
            this.kitSearchInput.nativeElement.value = this.currentKit.title;
        }
    }

    addKit() {
        const base = this.cloneObject(this.kit_base);
        this.new_kits.push(base);
        this.selectKit(this.new_kits.length - 1);
        this.printKits();
    }

    selectKit(index: number) {
        this.currentKitIndex = index;
        this.currentKit = this.new_kits[this.currentKitIndex];
    }

    removeKit(index: number) {
        this.lastKitDeleted = {index: index, kit: this.cloneObject(this.new_kits[index])};
        if (index === this.currentKitIndex) {
            if (index !== this.new_kits.length - 1) {
                this.selectKit(index + 1);
            } else if (index === this.new_kits.length - 1) {
                this.selectKit(index - 1);
            }
        }
        this.new_kits.splice(index, 1);
        this.fixKitIndexOnDelete(index);
    }

    fixKitIndexOnDelete(index: number) {
        if (index <= this.currentKitIndex) {
            this.currentKitIndex--;
        }
    }
    fixKitIndexOnUndo(index: number) {
        if (index <= this.currentKitIndex) {
            this.currentKitIndex++;
        }
    }

    undoLastKitDelete() {
        if (this.lastKitDeleted) {
            const index = this.lastKitDeleted.index;
            const kit = this.lastKitDeleted.kit;
            this.new_kits.splice(index, 0, kit);
            this.lastKitDeleted = null;
            this.fixKitIndexOnUndo(index);
        }
    }

    addKitPart(kit_index: number) {
        const obj = this.cloneObject(this.part_base);
        this.currentKit.parts.push(obj);
        this.printKits();
    }

    removeKitPart(kit_index: number, part_index: number) {
        this.currentKit.parts.splice(part_index, 1);
    }

    addKitPartLesson(kit_index: number, part_index: number, lesson: any) {
        this.currentKit.parts[part_index].lessons.push({id: lesson.id, uuid: lesson.uuid, title: lesson.title});
        this.printKits();
    }

    removeKitPartLesson(kit_index: number, part_index: number, lesson_index: number) {
        this.currentKit.parts[part_index].lessons.splice(lesson_index, 1);
    }

    moveDownKitPart(kit_index: number, index: number) {
        if (index < this.currentKit.parts.length - 1) {
            const part = this.currentKit.parts[index];
            this.currentKit.parts.splice(index, 1);
            this.currentKit.parts.splice(index + 1, 0, part);
        }
    }

    moveUpKitPart(kit_index: number, index: number) {
        if (index > 0) {
            const part = this.currentKit.parts[index];
            this.currentKit.parts.splice(index, 1);
            this.currentKit.parts.splice(index - 1, 0, part);
        }
    }

    moveKitPartLesson(kit_index: number, part_index: number, obj: any) {
        const fromIndex = obj.startIndex;
        const toIndex = obj.endIndex;
        const lesson = this.currentKit.parts[part_index].lessons[fromIndex];
        this.currentKit.parts[part_index].lessons.splice(fromIndex, 1);
        this.currentKit.parts[part_index].lessons.splice(toIndex, 0, lesson);

    }

    printKits() {
        console.log('this.new_kits', this.new_kits);
        console.log('this.currentKit', this.currentKit);
    }


    cloneObject(obj: any) {
        return JSON.parse(JSON.stringify(obj));
    }

    showDrop() {
        this.showSearchSuggestions = true;
    }

    hideDrop() {
        setTimeout(() => {
            this.showSearchSuggestions = false;
        }, 300);
    }

    showKitDrop() {
        this.showKitSearchSuggestions = true;
    }

    hideKitDrop() {
        setTimeout(() => {
            this.showKitSearchSuggestions = false;
        }, 300);
    }

    showKitLessonsDrop(kit_i: number, part_i: number) {
        this.KitLessonSearchFocused = {};
        this.KitLessonSearchFocused[kit_i + '_' + part_i] = true;
        this.showKitLessonSearchSuggestions[kit_i + '_' + part_i] = true;
    }

    hideKitLessonsDrop(kit_i: number, part_i: number) {
        this.KitLessonSearchFocused = {};
        setTimeout(() => {
            this.showKitLessonSearchSuggestions[kit_i + '_' + part_i] = false;
        }, 300);
    }

    resetExpend() {
        this.expendManagement = {};
    }

}
