import {Component, OnInit} from '@angular/core';
import {ApiService} from "../../../main/services/api.service";
import {animate, state, style, transition, trigger} from "@angular/animations";

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

    slides_options: any = [];

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

    lesson_base: any = {
        uuid: "",
        lesson_group_type: "",
        title: "",
        description: "",
        total_slides: -1,
        presentation_data: {
            "presentation_title": "",
            "presentation_topic": "",
            "presentation_lesson_data": {
                "sections": [
                    {
                        "slides": []
                    }
                ]
            }
        },
        presentation_data_version: -1,
        metadata: {}
    };

    lessons: any[] = [];

    expendManagement: any = {};

    constructor(
        private apiService: ApiService
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
                    const exclude_slide_types = ["test", "video"];
                    this.slides_options = this.slides_options.filter((o: any) => exclude_slide_types.indexOf(o.value) === -1);
                }
            },
            error: (error) => {
                console.log('getLessonGroupTypes error', error);
            }
        });
    }

    addLesson() {
        const base = JSON.parse(JSON.stringify(this.lesson_base));
        this.lessons.push(base);
        this.printLessons();
    }

    removeLesson(index: number) {
        this.lessons.splice(index, 1);
    }

    addSlide(lesson_index: number, slide_type_id: string) {
        const ids = this.slides_options.map((o: any) => o.key);
        const i = ids.indexOf(parseInt(slide_type_id));
        if (i > -1) {
            const group_type:  keyof LessonsEditComponent = this.slides_options[i].value;
            const obj = JSON.parse(JSON.stringify(this[group_type]));
            this.lessons[lesson_index].presentation_data.presentation_lesson_data.sections[0].slides.push(obj);
            this.printLessons();
        }
    }

    removeSlide(lesson_index: number, slide_index: number) {
        this.lessons[lesson_index].presentation_data.presentation_lesson_data.sections[0].slides.splice(slide_index, 1);
    }

    addSlideQuestion(lesson_index: number, slide_index: number, question_html_id:  string) {
        const question_type: any = $('#' + question_html_id).val();
        const i = this.question_options.indexOf(question_type);
        if (i > -1) {
            const group_type:  keyof LessonsEditComponent = question_type;
            const obj = JSON.parse(JSON.stringify(this[group_type]));
            this.lessons[lesson_index].presentation_data.presentation_lesson_data.sections[0].slides[slide_index].all_questions.push(obj);
            this.printLessons();
        }
    }

    removeSlideQuestion(lesson_index: number, slide_index: number, question_index: number) {
        this.lessons[lesson_index].presentation_data.presentation_lesson_data.sections[0].slides[slide_index].all_questions.splice(question_index, 1);
    }

    addSlideMultipleQuestionAnswer(lesson_index: number, slide_index: number, question_index: number) {
        const obj = {
            "answer": "",
            "is_correct": false
        };
        this.lessons[lesson_index].presentation_data.presentation_lesson_data.sections[0].slides[slide_index].all_questions[question_index].question.answers.push(obj);
        this.printLessons();
    }

    removeSlideMultipleQuestionAnswer(lesson_index: number, slide_index: number, question_index: number, question_answer_index: number) {
        this.lessons[lesson_index].presentation_data.presentation_lesson_data.sections[0].slides[slide_index].all_questions[question_index].question.answers.splice(question_answer_index, 1);
    }

    printLessons() {
        console.log('this.lessons', this.lessons);
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

    expend(lesson_index: number = -1, slide_index: number = -1, question_index: number = -1) {
        if (lesson_index > -1) {
            if (!this.expendManagement[lesson_index]) {
                this.expendManagement[lesson_index] = true;
            }
            if (slide_index > -1) {
                if (!this.expendManagement[lesson_index + '_' + slide_index]) {
                    this.expendManagement[lesson_index + '_' + slide_index] = true;
                }
            }
            if (question_index > -1) {
                if (!this.expendManagement[lesson_index + '_' + slide_index + '_' + question_index]) {
                    this.expendManagement[lesson_index + '_' + slide_index + '_' + question_index] = true;
                }
            }
        }
    }

}
