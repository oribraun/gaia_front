import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TestPrepRoutingModule } from './test-prep-routing.module';
import {TestPrepDashboardComponent} from "./components/dashboard/dashboard.component";
import {PracticeLessonComponent} from "./components/practice-lesson/practice-lesson.component";
import {SharedSlidesModule} from "../shared-slides/shared-slides.module";


@NgModule({
    declarations: [
        TestPrepDashboardComponent,
        PracticeLessonComponent,
    ],
    imports: [
        CommonModule,
        SharedSlidesModule,
        TestPrepRoutingModule
    ]
})
export class TestPrepModule { }
