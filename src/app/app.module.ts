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
        AboutComponent,
        DashboardComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpClientModule,
        AppRoutingModule
    ],
    providers: [
        // {provide: APP_BASE_HREF, useValue: '/static/client/'},
        Config
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
