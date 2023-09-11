export class Presentation {

    current_objective_index!: number
    current_section_index!: number
    current_slide_index!: number

    estimated_duration!: number
    presentation_done!: boolean
    presentation_title!: string
    presentation_topic!: string
    sections!: PresentationSection[]
    teacher!: any

    constructor(obj?: any) {
        if (obj) {
            for (const key in obj) {
                if (obj[key] !== undefined && obj[key] !== null) {
                    if (key === 'sections') {
                        this[key] = []
                        for (let item of obj[key]) {
                            this[key].push(new PresentationSection(item))
                        }
                    } else if (key === 'teacher') {
                        this[key] = new PresentationTeacher(obj[key])
                    } else {
                        // @ts-ignore
                        this[key] = obj[key];
                    }
                }
            }
        }
    }
}

export class PresentationSection {
    section_title!: string
    section_topic!: string
    slides!: PresentationSlide[]

    constructor(obj?: any) {
        if (obj) {
            for (const key in obj) {
                if (obj[key] !== undefined && obj[key] !== null) {
                    if (key !== 'slides') {
                        // @ts-ignore
                        this[key] = obj[key];
                    } else {
                        this.searchBundles(obj, key)
                    }
                }
            }
        }
    }

    searchBundles(obj: any, key: any) {
        // @ts-ignore
        this[key] = []
        let bundle_id_to_slides = Object()
        for (let item of obj[key]) {
            // @ts-ignore
            this[key].push(new PresentationSlide(item))
            // @ts-ignore
            let slide = this[key][this[key].length-1]
            if(slide.bundle_id!=-1){
                if(bundle_id_to_slides.hasOwnProperty(slide.bundle_id)) {
                    bundle_id_to_slides[slide.bundle_id].push(slide)
                } else {
                    bundle_id_to_slides[slide.bundle_id] = [slide]
                }
            }
        }
        for (let bundle_id in bundle_id_to_slides) {
            let bundle_list = bundle_id_to_slides[bundle_id]
            for (let slide of bundle_list){
                slide.bundle = bundle_list
                slide.bundle_len = bundle_list.length
                const isThisMe = (element: any) => element === slide;
                slide.index_in_bundle = bundle_list.findIndex(isThisMe)
            }
        }
    }
}

export class PresentationSlide {
    slide_title!: string
    slide_visual_description!: string
    slide_type!: string
    slide_objectives!: any[]
    full_screen!: boolean
    estimated_duration!: number
    native_language_text!: any
    teacher_name!: string
    teacher_image_path!: string
    word_image_path!: string
    image_path!: string
    text!: string
    word!: string
    should_read_native:boolean = false
    word_list!: string[]
    words!: string[]
    bundle_id:number = -1
    bundle:any[] = []
    bundle_len:number=0
    index_in_bundle:number=-1

    blanks !:string[]
    blanks_options !:string[][]
    target_sentence !:string[]
    blanked_sentence !:string
    video_details!: VideoDetails

    constructor(obj?: any) {
        if (obj) {
            for (const key in obj) {
                if (obj[key] !== undefined && obj[key] !== null) {
                    if (key === 'video_details') {
                        this[key] = new VideoDetails(obj[key]);
                    } else {
                        // @ts-ignore
                        this[key] = obj[key];
                    }
                }
            }
        }
    }
}

export class PresentationTeacher {

    name!: string
    image_path!: string
    gender!: string
    style!: string
    age!: number

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

    id!: string
    start_time!: number
    end_time!: number

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
