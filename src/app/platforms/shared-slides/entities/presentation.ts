export class Presentation {

    current_objective_index!: number;
    current_section_index!: number;
    current_slide_index!: number;

    estimated_duration!: number;
    presentation_done!: boolean;
    all_presentation_tasks_completed!: boolean;
    presentation_title!: string;
    presentation_topic!: string;
    sections!: PresentationSection[];
    slides_flat: object[] = [];
    teacher!: any;
    timer_total: number = 60 * 60;
    timer_sec: number = 0;
    timer_timeout_msg: string = "test times up - please move on";
    timer_timeout_sec: number = -1;

    constructor(obj?: any) {
        if (obj) {
            for (const key in obj) {
                if (obj[key] !== undefined && obj[key] !== null) {
                    if (key === 'sections') {
                        this[key] = [];
                        for (const item of obj[key]) {
                            this[key].push(new PresentationSection(item));
                        }
                    } else if (key === 'teacher') {
                        this[key] = new PresentationTeacher(obj[key]);
                    } else {
                        // @ts-ignore
                        this[key] = obj[key];
                    }
                }
            }
            this.buildSlidesFlat();
        }
    }

    buildSlidesFlat() {
        let section_index = 0;
        let slide_idx = 0;
        let flat_index = 0;
        for (const section of this.sections) {
            for (const slide of section.slides) {
                slide.prev = this.slides_flat.length > 0 ? this.slides_flat[this.slides_flat.length - 1] : null;
                slide.flat_index = flat_index;
                this.slides_flat.push({'section_idx':section_index, 'slide_idx': slide_idx});
                slide_idx += 1;
                flat_index += 1;
            }
            slide_idx = 0;
            section_index += 1;
        }
    }
}

export class PresentationSection {
    section_title!: string;
    section_topic!: string;
    section_variables!: any;
    slides!: PresentationSlide[];

    constructor(obj?: any) {
        if (obj) {
            for (const key in obj) {
                if (obj[key] !== undefined && obj[key] !== null) {
                    if (key !== 'slides') {
                        // @ts-ignore
                        this[key] = obj[key];
                    } else {
                        this.searchBundles(obj, key);
                    }
                }
            }
        }
    }

    searchBundles(obj: any, key: any) {
        // @ts-ignore
        this[key] = [];
        const bundle_id_to_slides = Object();
        for (const item of obj[key]) {
            // @ts-ignore
            this[key].push(new PresentationSlide(item));
            // @ts-ignore
            const slide = this[key][this[key].length - 1];
            slide.section = this;
            if(slide.bundle_id != -1) {
                if(bundle_id_to_slides.hasOwnProperty(slide.bundle_id)) {
                    bundle_id_to_slides[slide.bundle_id].push(slide);
                } else {
                    bundle_id_to_slides[slide.bundle_id] = [slide];
                }
            }
        }
        for (const bundle_id in bundle_id_to_slides) {
            const bundle_list = bundle_id_to_slides[bundle_id];
            for (const slide of bundle_list) {
                slide.bundle = bundle_list;
                slide.bundle_len = bundle_list.length;
                const isThisMe = (element: any) => element === slide;
                slide.index_in_bundle = bundle_list.findIndex(isThisMe);
            }
        }
    }
}

export class PresentationSlide {
    slide_uid!: string;
    slide_title!: string;
    slide_visual_description!: string;
    slide_type!: string;
    slide_objectives!: any[];
    slide_chat!: any[];
    qna_review!: any[];
    pace!:number;
    hint_used:boolean = false;
    full_screen!: boolean;
    estimated_duration!: number;
    native_language_text!: any;
    teacher_name!: string;
    teacher_image_path!: string;
    word_image_path!: string;
    background_image!: string;
    image_path!: string;
    mode!: string;
    multiple_choice_question!:any;
    answer_options!: string[];
    correct_answer!: string;
    text!: string;
    sentence_start!:string;
    video_completed!: boolean;
    writing!: string;
    texts!: string[];
    loaded_text!: string;
    load_fields!: string[];
    section_variables!: string;
    add_loaded_text_to_dynamic_text!: boolean;
    examples!: string[];
    word!: string;
    should_read_native:boolean = false;
    word_list!: string[];
    words!: string[];
    options!: string[];
    bundle_id:number = -1;
    bundle:any[] = [];
    bundle_len:number = 0;
    question_index:number = 0;
    index_in_bundle:number = -1;
    topic!:string;
    essay_type!:string;
    unseen_text!:string;
    grades!:string;
    score!:number;
    min_number_of_words!:number;
    time_in_minutes!:number;
    iframe_path!:string;
    html!:string;
    js!:string;
    css!:string;
    game_duration:number = 4;
    blanks !:string[];
    blanks_options !:string[][];
    target_sentence !:string[];
    all_questions !:any[];
    all_answers !:any;
    marked_chars:number[] = [];
    notes:string = "";
    blanked_sentence !:string;
    video_details!: VideoDetails;
    prev:any = null;
    flat_index:number = 0;
    practice!:string;
    section!:any;
    core_instructions:any = {};
    audio_path!: string;
    timer_sec: number = 0;
    timer_timeout_msg: string = "test times up - please move on";
    timer_timeout_sec: number = -1;


    constructor(obj?: any) {
        if (obj) {
            for (const key in obj) {
                if (obj[key] !== undefined && obj[key] !== null) {
                    if (key === 'video_details') {
                        this[key] = new VideoDetails(obj[key]);
                    }
                    else {
                        // @ts-ignore
                        this[key] = obj[key];
                    }
                }
            }
        }
    }
}

export class PresentationTeacher {

    name!: string;
    image_path!: string;
    gender!: string;
    style!: string;
    age!: number;

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

export class VideoDetails {

    id!: string;
    start_time!: number;
    end_time!: number;
    url!: string;

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
