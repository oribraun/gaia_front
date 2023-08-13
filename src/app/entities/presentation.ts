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
                        this[key] = []
                        for (let item of obj[key]) {
                            this[key].push(new PresentationSlide(item))
                        }
                    }
                }
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
