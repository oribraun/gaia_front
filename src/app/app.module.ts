import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import {YouTubePlayerModule} from '@angular/youtube-player';
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
import { DashboardComponent } from './components/company-admin/dashboard/dashboard.component';
// import {APP_BASE_HREF} from "@angular/common";
import { NgxEchartsModule } from 'ngx-echarts';
import { PrivacyComponent } from './components/privacy/privacy.component';
import { BasicCardComponent } from './components/shared/basic-card/basic-card.component';
import { BasicCardListComponent } from './components/shared/basic-card-list/basic-card-list.component';
import {RangePipe} from "./pipes/range/range.pipe";
import { PlaygroundComponent } from './components/playground/playground.component';
import { CompareVendorsComponent } from './components/compare-vendors/compare-vendors.component';
import { PluginDashboardComponent } from './components/plugin-dashboard/plugin-dashboard.component';
import { SettingsComponent } from './components/company-admin/settings/settings.component';
import { ChatbotComponent } from './components/company-admin/chatbot/chatbot.component';
import { CompanyAdminComponent } from './components/company-admin/company-admin.component';
import { HowToImplementComponent } from './components/company-admin/how-to-implement/how-to-implement.component';
import { DatetimeFormatPipe } from './pipes/datetime-format/datetime-format.pipe';
import { ChatComponent } from './components/chat/chat.component';
import { GaiaDataRoomComponent } from './components/gaia-data-room/gaia-data-room.component';
import { SafePipe } from './pipes/safe.pipe';
import { RecorderComponent } from './components/recorder/recorder.component';
import { LessonComponent } from './components/lesson/lesson.component';
import { WhiteBoardComponent } from './components/lesson/white-board/white-board.component';
import { PanelBoardComponent } from './components/lesson/panel-board/panel-board.component';
import { SwipeDirective } from './directives/swipe.directive';
import { GreetingComponent } from './components/lesson/slides/greeting/greeting.component';
import { ReadingComponent } from './components/lesson/slides/reading/reading.component';
import { WordRepeaterComponent } from './components/lesson/slides/word-repeater/word-repeater.component';
import { AgendaComponent } from './components/lesson/slides/agenda/agenda.component';
import { EndingComponent } from './components/lesson/slides/ending/ending.component';
import { ImageGeneratorComponent } from './components/lesson/slides/image-generator/image-generator.component';
import { BlanksComponent } from './components/lesson/slides/blanks/blanks.component';
import { VideoComponent } from './components/lesson/slides/video/video.component';

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
        CompareVendorsComponent,
        PluginDashboardComponent,
        SettingsComponent,
        ChatbotComponent,
        CompanyAdminComponent,
        HowToImplementComponent,
        DatetimeFormatPipe,
        ChatComponent,
        GaiaDataRoomComponent,
        SafePipe,
        RecorderComponent,
        LessonComponent,
        WhiteBoardComponent,
        PanelBoardComponent,
        SwipeDirective,
        GreetingComponent,
        ReadingComponent,
        WordRepeaterComponent,
        AgendaComponent,
        EndingComponent,
        ImageGeneratorComponent,
        BlanksComponent,
        VideoComponent,
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpClientModule,
        AppRoutingModule,
        YouTubePlayerModule,
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
