import {NgModule, Provider} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import { BrowserModule } from '@angular/platform-browser';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
// Injection token for the Http Interceptors multi-provider
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import {MyHttpInterceptor} from "./interceptors/my-http-interceptor";

/** Provider for the Noop Interceptor. */
export const httpInterceptorProviders: Provider =
  { provide: HTTP_INTERCEPTORS, useClass: MyHttpInterceptor, multi: true };

import {Config} from "./config";
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { LoginComponent } from './components/login/login.component';
import { DragAndDropDirective } from './directives/drag-and-drop.directive';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';
import { AboutComponent } from './components/about/about.component';
import {PrivacyComponent} from "./components/privacy/privacy.component";
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

import { CapitalizePipe } from './pipes/capitalize/capitalize.pipe';
import { BuyComponent } from './components/buy/buy.component';
import { HeaderComponent } from './components/header/header.component';
import { OnBoardingComponent } from './components/on-boarding/on-boarding.component';

import {YouTubePlayerModule} from '@angular/youtube-player';
import {SharedSlidesModule} from "../shared-slides/shared-slides.module";
import {IeltsModule} from "../ielts/ielts.module";
import {ChildrensModule} from "../childrens/childrens.module";
import { AlertComponent } from './components/alert/alert.component';
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
        PrivacyComponent,
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
        AlertComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        HttpClientModule,
        AppRoutingModule,
        YouTubePlayerModule,
        SharedSlidesModule,
        IeltsModule,
        ChildrensModule
    ],
    providers: [
        // {provide: APP_BASE_HREF, useValue: '/static/client/'},
        Config,
        httpInterceptorProviders
    ],
    exports: [
        SafePipe,
        SafeHtmlPipe
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
