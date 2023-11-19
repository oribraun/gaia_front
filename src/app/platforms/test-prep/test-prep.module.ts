import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule} from "@angular/forms";

import { TestPrepRoutingModule } from './test-prep-routing.module';
import {DashboardComponent} from "./components/dashboard/dashboard.component";
import {PracticeLessonComponent} from "./components/practice-lesson/practice-lesson.component";
import {SharedSlidesModule} from "../shared-slides/shared-slides.module";
import { VocabularyComponent } from './components/vocabulary/vocabulary.component';
import { ReviewComponent } from './components/review/review.component';
import { PlanComponent } from './components/plan/plan.component';



@NgModule({
    declarations: [
        DashboardComponent,
        PracticeLessonComponent,
        VocabularyComponent,
        ReviewComponent,
        PlanComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        SharedSlidesModule,
        TestPrepRoutingModule
    ]
})
export class TestPrepModule { }
