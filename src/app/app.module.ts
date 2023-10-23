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
import { BaseSlideComponent } from './components/lesson/slides/base-slide.component';
import { GreetingComponent } from './components/lesson/slides/greeting/greeting.component';
import { ReadingComponent } from './components/lesson/slides/reading/reading.component';
import { WordRepeaterComponent } from './components/lesson/slides/word-repeater/word-repeater.component';
import { AgendaComponent } from './components/lesson/slides/agenda/agenda.component';
import { EndingComponent } from './components/lesson/slides/ending/ending.component';
import { ImageGeneratorComponent } from './components/lesson/slides/image-generator/image-generator.component';
import { BlanksComponent } from './components/lesson/slides/blanks/blanks.component';
import { VideoComponent } from './components/lesson/slides/video/video.component';
import { ScreenBoardComponent } from './components/lesson/screen-board/screen-board.component';
import { ChatBoardComponent } from './components/lesson/chat-board/chat-board.component';
import { TitleComponent } from './components/lesson/slides/title/title.component';
import { WordTranslatorComponent } from './components/lesson/slides/word-translator/word-translator.component';
import { HelpComponent } from './components/lesson/panel-board/help/help.component';
import { EmbedGameComponent } from './components/lesson/slides/embed-game/embed-game.component';
import { TemplateComponent } from './components/lesson/slides/template/template.component';
import { WritingComponent } from './components/lesson/slides/writing/writing.component';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { RandomSelectorComponent } from './components/lesson/slides/random-selector/random-selector.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CapitalizePipe } from './pipes/capitalize/capitalize.pipe';
import { BuyComponent } from './components/buy/buy.component';
import { HeaderComponent } from './components/header/header.component';
import { OnBoardingComponent } from './components/on-boarding/on-boarding.component';
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
        BaseSlideComponent,
        GreetingComponent,
        ReadingComponent,
        WordRepeaterComponent,
        AgendaComponent,
        EndingComponent,
        ImageGeneratorComponent,
        BlanksComponent,
        VideoComponent,
        ScreenBoardComponent,
        ChatBoardComponent,
        TitleComponent,
        WordTranslatorComponent,
        HelpComponent,
        EmbedGameComponent,
        TemplateComponent,
        WritingComponent,
        RandomSelectorComponent,
        DashboardComponent,
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
    ],
    providers: [
        // {provide: APP_BASE_HREF, useValue: '/static/client/'},
        Config
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
