import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import {YouTubePlayerModule} from '@angular/youtube-player';
import { AppComponent } from './app.component';
import {Config} from "./config";
import { HomeComponent } from './components/home/home.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { LoginComponent } from './components/login/login.component';
import {FormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import { DragAndDropDirective } from './directives/drag-and-drop.directive';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';
import { AboutComponent } from './components/about/about.component';
// import {APP_BASE_HREF} from "@angular/common";
import { NgxEchartsModule } from 'ngx-echarts';
import {RangePipe} from "./pipes/range/range.pipe";
import { DatetimeFormatPipe } from './pipes/datetime-format/datetime-format.pipe';
import { SafePipe } from './pipes/safe.pipe';
import { LessonComponent } from './components/lesson/lesson.component';
import { WhiteBoardComponent } from './components/lesson/white-board/white-board.component';
import { PanelBoardComponent } from './components/lesson/panel-board/panel-board.component';
import { SwipeDirective } from './directives/swipe.directive';
import { ScreenBoardComponent } from './components/lesson/screen-board/screen-board.component';
import { ChatBoardComponent } from './components/lesson/chat-board/chat-board.component';
import { HelpComponent } from './components/lesson/panel-board/help/help.component';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { CapitalizePipe } from './pipes/capitalize/capitalize.pipe';
import { BuyComponent } from './components/buy/buy.component';
import { HeaderComponent } from './components/header/header.component';
import { OnBoardingComponent } from './components/on-boarding/on-boarding.component';


import {SharedSlidesModule} from "../shared-slides/shared-slides.module";
import {TestPrepModule} from "../test-prep/test-prep.module";
import {ChildrensModule} from "../childrens/childrens.module";
// only for childrens app
@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        SidebarComponent,
        LoginComponent,
        DragAndDropDirective,
        SafeHtmlPipe,
        RangePipe,
        AboutComponent,
        DatetimeFormatPipe,
        SafePipe,
        LessonComponent,
        WhiteBoardComponent,
        PanelBoardComponent,
        SwipeDirective,
        ScreenBoardComponent,
        ChatBoardComponent,
        HelpComponent,
        CapitalizePipe,
        BuyComponent,
        HeaderComponent,
        OnBoardingComponent,
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpClientModule,
        AppRoutingModule,
        YouTubePlayerModule,
        AngularEditorModule,
        NgxEchartsModule.forRoot({
            /**
             * This will import all modules from echarts.
             * If you only need custom modules,
             * please refer to [Custom Build] section.
             */
            echarts: () => import('echarts'), // or import('./path-to-my-custom-echarts')
        }),
        SharedSlidesModule,
        TestPrepModule,
        ChildrensModule
    ],
    providers: [
        // {provide: APP_BASE_HREF, useValue: '/static/client/'},
        Config
    ],
    exports: [
        SafePipe,
        SafeHtmlPipe
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
