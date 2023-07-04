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
        GaiaDataRoomComponent
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
