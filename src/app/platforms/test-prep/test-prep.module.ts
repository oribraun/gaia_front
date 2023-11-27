import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule} from "@angular/forms";

import { NgxEchartsModule } from 'ngx-echarts';

import { TestPrepRoutingModule } from './test-prep-routing.module';
import {DashboardComponent} from "./components/dashboard/dashboard.component";
import {PracticeLessonComponent} from "./components/practice-lesson/practice-lesson.component";
import {SharedSlidesModule} from "../shared-slides/shared-slides.module";
import { VocabularyComponent } from './components/vocabulary/vocabulary.component';
import { ReviewComponent } from './components/review/review.component';
import { PlanComponent } from './components/plan/plan.component';
import {PieChartComponent} from "./components/charts/pie-chart/pie-chart.component";
import { BarChartComponent } from './components/charts/bar-chart/bar-chart.component';



@NgModule({
    declarations: [
        DashboardComponent,
        PracticeLessonComponent,
        VocabularyComponent,
        ReviewComponent,
        PlanComponent,
        PieChartComponent,
        BarChartComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        SharedSlidesModule,
        TestPrepRoutingModule,

        NgxEchartsModule.forRoot({
            /**
             * This will import all modules from echarts.
             * If you only need custom modules,
             * please refer to [Custom Build] section.
             */
            echarts: () => import('echarts'), // or import('./path-to-my-custom-echarts')
        }),
    ]
})
export class TestPrepModule { }
