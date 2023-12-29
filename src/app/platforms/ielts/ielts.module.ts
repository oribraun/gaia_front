import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule} from "@angular/forms";

import { NgxEchartsModule } from 'ngx-echarts';

import { IeltsRoutingModule } from './ielts-routing.module';
import {DashboardComponent} from "./components/dashboard/dashboard.component";
import {PracticeLessonComponent} from "./components/practice-lesson/practice-lesson.component";
import {HttpLoaderFactory, SharedModule} from "../shared/shared.module";
import { VocabularyComponent } from './components/vocabulary/vocabulary.component';
import { ReviewComponent } from './components/review/review.component';
import { PlanComponent } from './components/plan/plan.component';
import {PieChartComponent} from "./components/charts/pie-chart/pie-chart.component";
import { BarChartComponent } from './components/charts/bar-chart/bar-chart.component';
import { DonutChartComponent } from './components/charts/donut-chart/donut-chart.component';
import {TranslateLoader, TranslateModule} from "@ngx-translate/core";
import {HttpClient} from "@angular/common/http";



@NgModule({
    declarations: [
        DashboardComponent,
        PracticeLessonComponent,
        VocabularyComponent,
        ReviewComponent,
        PlanComponent,
        PieChartComponent,
        BarChartComponent,
        DonutChartComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        SharedModule,
        IeltsRoutingModule,

        NgxEchartsModule.forRoot({
            /**
             * This will import all modules from echarts.
             * If you only need custom modules,
             * please refer to [Custom Build] section.
             */
            echarts: () => import('echarts') // or import('./path-to-my-custom-echarts')
        }),
        TranslateModule.forChild({
            defaultLanguage: 'en',
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        })
    ]
})
export class IeltsModule { }
