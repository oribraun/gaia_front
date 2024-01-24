export class Kit {
    id: number;
    direction: string;
    description: string;
    title: string;
    last_lesson_id: number;
    parts: kitPart[] = [];

    constructor(data: any) {
        this.id = data.id;
        this.description = data.description;
        this.direction = data.direction;
        this.title = data.title;
        this.last_lesson_id = data.last_lesson_id;
        this.parts = data.parts.map((partData: any) => new kitPart(partData));
    }
}

class kitPart {
    title: string;
    lessons: kitLesson[] = [];

    constructor(data: any) {
        this.title = data.title;
        if (Array.isArray(data.lessons)) {
            this.lessons = data.lessons.map((lessonData: any) => new kitLesson(lessonData));
        }
    }
}

class kitLesson {
    id: number;
    title: string;

    constructor(data: any) {
        this.id = data.id;
        this.title = data.title;
    }
}

export class KitItem {
    id: number;
    title: string;
    direction: string;
    status: string;

    constructor(init?:Partial<KitItem>) {
        Object.assign(this, init);
    }
}

export class KitTest {
    title: string;
    value: string;

    constructor(init?:Partial<KitTest>) {
        Object.assign(this, init);
    }
}
