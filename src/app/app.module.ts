import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {Config} from "./config";
import { TestComponent } from './components/test/test.component';
import { HomeComponent } from './components/home/home.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { LoginComponent } from './components/login/login.component';
import {FormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import { PromptOptimizerComponent } from './components/prompt-optimizer/prompt-optimizer.component';
import { DragAndDropDirective } from './directives/drag-and-drop.directive';
import { AnalyzerComponent } from './components/analyzer/analyzer.component';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';
import { AboutComponent } from './components/about/about.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
// import {APP_BASE_HREF} from "@angular/common";
import { NgxEchartsModule } from 'ngx-echarts';
import { PrivacyComponent } from './components/privacy/privacy.component';
import { BasicCardComponent } from './components/dashboard/basic-card/basic-card.component';
import { BasicCardListComponent } from './components/dashboard/basic-card-list/basic-card-list.component';
import {RangePipe} from "./pipes/range/range.pipe";
import { PlaygroundComponent } from './components/playground/playground.component';
import { CompareVendorsComponent } from './components/compare-vendors/compare-vendors.component';

@NgModule({
    declarations: [
        AppComponent,
        TestComponent,
        HomeComponent,
        SidebarComponent,
        LoginComponent,
        PromptOptimizerComponent,
        DragAndDropDirective,
        AnalyzerComponent,
        SafeHtmlPipe,
        RangePipe,
        AboutComponent,
        DashboardComponent,
        PrivacyComponent,
        BasicCardComponent,
        BasicCardListComponent,
        PlaygroundComponent,
        CompareVendorsComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpClientModule,
        AppRoutingModule,
        NgxEchartsModule.forRoot({
            /**
             * This will import all modules from echarts.
             * If you only need custom modules,
             * please refer to [Custom Build] section.
             */
            echarts: () => import('echarts'), // or import('./path-to-my-custom-echarts')
        }),
    ],
    providers: [
        // {provide: APP_BASE_HREF, useValue: '/static/client/'},
        Config
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
