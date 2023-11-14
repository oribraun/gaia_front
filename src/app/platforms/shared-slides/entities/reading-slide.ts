interface AllAnswers {
    [key: string]: UnseenAnswer;
}

export class ReadingSlide {
    unseen_text!: string;
    question_index!: number;
    all_questions: UnseenQuestion[] = [];
    all_answers: AllAnswers = {};
    all_questions_answered!: boolean;

    constructor(obj?: any) {
        if (obj) {
            this.unseen_text = obj.unseen_text;
            this.question_index = obj.question_index;
            if (obj.all_questions && obj.all_questions.length) {
                for(let q of obj.all_questions) {
                    this.all_questions.push(new UnseenQuestion(q))
                }
            }
            if (obj.all_answers) {
                for(let key in obj.all_answers) {
                    this.all_answers[key] = new UnseenAnswer(obj.all_answers[key])
                }
            }
        }
    }
}

export class UnseenQuestion {
    hints!: UnseenHint;
    level!: number;
    question!: string | UnseenMultipleOptionsQuestion;
    question_id!: number;
    question_type!: string;
    constructor(obj?: any) {
        if (obj) {
            for (const key in obj) {
                if (obj[key] !== undefined && obj[key] !== null) {
                    if (key === 'question' && typeof obj[key] !== 'string') {
                        this[key] = new UnseenMultipleOptionsQuestion(obj[key])
                    } else if (key === 'hints') {
                        this[key] = new UnseenHint(obj[key])
                    } else {
                        // @ts-ignore
                        this[key] = obj[key];
                    }
                }
            }
        }
    }
}

export class UnseenMultipleOptionsQuestion {
    question!: string;
    answers: UnseenMultipleOptionsAnswers[] = [];
    constructor(obj?: any) {
        if (obj) {
            for (const key in obj) {
                if (obj[key] !== undefined && obj[key] !== null) {
                    if (key === 'answers') {
                        if (obj.answers && obj.answers.length) {
                            for(let q of obj.answers) {
                                this.answers.push(new UnseenMultipleOptionsAnswers(q))
                            }
                        }
                    } else {
                        // @ts-ignore
                        this[key] = obj[key];
                    }
                }
            }
        }
    }
}

export class UnseenMultipleOptionsAnswers {
    answer!: string;
    is_correct!: boolean;
    constructor(obj?: any) {
        if (obj) {
            for (const key in obj) {
                if (obj[key] !== undefined && obj[key] !== null) {
                    // @ts-ignore
                    this[key] = obj[key];
                }
            }
        }
    }
}

export class UnseenHint {
    quotes!: string;
    guidance!: string;
    correct_answer!: string;
    // audio_path!: string;
    constructor(obj?: any) {
        if (obj) {
            for (const key in obj) {
                if (obj[key] !== undefined && obj[key] !== null) {
                    // @ts-ignore
                    this[key] = obj[key];
                }
            }
        }
    }
}

interface MultipleAnswers {
    [key: string]: boolean;
}

export class UnseenAnswer {
    pace!: number;
    score!: number;
    hint_used!: boolean;
    answer_text!: string;
    explanation!: string;
    question_idx!: number;
    question_type!: string;
    multiple_answers!: MultipleAnswers;
    is_correct_answer!: boolean | number;

    constructor(obj?: any) {
        if (obj) {
            for (const key in obj) {
                if (obj[key] !== undefined && obj[key] !== null) {
                    if (key === 'multiple_answers' && this.isValidMultipleAnswers(obj[key])) {
                        this.multiple_answers = obj[key];
                    } else {
                        // @ts-ignore
                        this[key] = obj[key];
                    }
                }
            }
        }
    }

    private isValidMultipleAnswers(multiple_answers: MultipleAnswers): boolean {
        const keys = Object.keys(multiple_answers);
        const values = Object.values(multiple_answers);

        // Check if all keys are strings and all values are booleans
        return keys.every(key => typeof key === "string") && values.every(value => typeof value === "boolean");
    }
}
