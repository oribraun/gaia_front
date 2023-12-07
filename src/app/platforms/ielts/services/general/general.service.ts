import { Injectable } from '@angular/core';
import {ApiService} from "../../../main/services/api.service";

@Injectable({
    providedIn: 'root'
})
export class GeneralService {

    constructor(
        private apiService: ApiService
    ) { }

    generateNewLesson(courseTypeId: any, course_plan_id: number) {
        return new Promise((resolve, reject) => {
            // this.gettingNewLesson = true;
            this.apiService.getUserNewLesson({
                current_course_id: courseTypeId,
                plan_id: course_plan_id,
            }).subscribe({
                next: (response: any) => {
                    // this.gettingNewLesson = false;
                    if (response.err) {
                        console.log('generateNewLesson err', response)
                        reject(response.errMessage)
                    } else {
                        const id = response.id
                        resolve(id)
                    }
                },
                error: (error) => {
                    console.log('generateNewLesson error', error)
                    // this.gettingNewLesson = false;
                    reject(error)
                },
            })
        })
    }

    getOrGenerateLesson(courseTypeId: any, course_plan_id: number, specific_lesson_id: number = -1) {
        return new Promise((resolve, reject) => {
            // this.gettingNewLesson = true;
            const obj: any = {
                current_course_id: courseTypeId,
                plan_id: course_plan_id,
            }
            if (specific_lesson_id > -1) {
                obj['specific_lesson_id'] = specific_lesson_id
            }
            this.apiService.getOrGenerateLesson(obj).subscribe({
                next: (response: any) => {
                    // this.gettingNewLesson = false;
                    if (response.err) {
                        console.log('getOrGenerateLesson err', response)
                        reject(response.errMessage)
                    } else {
                        const id = response.id
                        resolve(id)
                    }
                },
                error: (error) => {
                    console.log('getOrGenerateLesson error', error)
                    // this.gettingNewLesson = false;
                    reject(error)
                },
            })
        })
    }
}
