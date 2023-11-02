import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap} from "@angular/router";

@Component({
  selector: 'app-practice-lesson',
  templateUrl: './practice-lesson.component.html',
  styleUrls: ['./practice-lesson.component.less']
})
export class PracticeLessonComponent implements OnInit {

    lesson_id!: number;

    constructor(
        private route: ActivatedRoute,
    ) {
        this.route.paramMap.subscribe((params: ParamMap) => {
            const lesson_id = params.get('id')
            if (lesson_id) {
                this.lesson_id = parseInt(lesson_id);
            }
        })
    }
    ngOnInit(): void {
        console.log('this.lesson_id', this.lesson_id)
    }

}
