import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {TestComponent} from "./components/test/test.component";
import {HomeComponent} from "./components/home/home.component";
import {LoginComponent} from "./components/login/login.component";
import {PromptOptimizerComponent} from "./components/prompt-optimizer/prompt-optimizer.component";
import {AnalyzerComponent} from "./components/analyzer/analyzer.component";
import {AuthGuard} from "./guards/auth.guard";
import {AuthBasicGuard} from "./guards/auth_basic.guard";
import {AboutComponent} from "./components/about/about.component";
import {DashboardComponent} from "./components/company-admin/dashboard/dashboard.component";
import {PrivacyComponent} from "./components/privacy/privacy.component";
import {PlaygroundComponent} from "./components/playground/playground.component";
import {CompareVendorsComponent} from "./components/compare-vendors/compare-vendors.component";
import {PluginDashboardComponent} from "./components/plugin-dashboard/plugin-dashboard.component";
import {AuthCompanyAdminGuard} from "./guards/auth-company-admin.guard";
import {SettingsComponent} from "./components/company-admin/settings/settings.component";
import {ChatbotComponent} from "./components/company-admin/chatbot/chatbot.component";
import {CompanyAdminComponent} from "./components/company-admin/company-admin.component";
import {HowToImplementComponent} from "./components/company-admin/how-to-implement/how-to-implement.component";
import {GaiaDataRoomComponent} from "./components/gaia-data-room/gaia-data-room.component";
import {AuthGaialabsCompanyGuard} from "./guards/auth-gaialabs-company.guard";
import {RecorderComponent} from "./components/recorder/recorder.component";
import {LessonComponent} from "./components/lesson/lesson.component";

const routes: Routes = [
    { path: '', component: HomeComponent, pathMatch : 'full' },
    { path: 'login', component: LoginComponent, pathMatch : 'full' },
    { path: 'login/:type', component: LoginComponent, pathMatch : 'full' },
    { path: 'about', component: AboutComponent, pathMatch : 'full' },
    { path: 'privacy-policy', component: PrivacyComponent, pathMatch : 'full' },
    { path: 'prompt-optimizer', component: PromptOptimizerComponent, pathMatch : 'full', canActivate: [AuthGuard]},
    { path: 'prompt-optimizer2', component: PromptOptimizerComponent, pathMatch : 'full'},
    { path: 'analyzer', component: AnalyzerComponent, pathMatch : 'full', canActivate: [AuthGuard] },
    { path: 'plugin-dashboard', component: PluginDashboardComponent, pathMatch : 'full', canActivate: [AuthGuard] },
    { path: 'playground', component: PlaygroundComponent, pathMatch : 'full', canActivate: [AuthGuard] },
    { path: 'compare-vendors', component: CompareVendorsComponent, pathMatch : 'full', canActivate: [AuthGuard] },
    // { path: 'dashboard', component: DashboardComponent, pathMatch : 'full', canActivate: [AuthCompanyAdminGuard] },
    // { path: 'settings', component: SettingsComponent, pathMatch : 'full', canActivate: [AuthCompanyAdminGuard] },
    // { path: 'smart-router', component: SmartRouterComponent, pathMatch : 'full', canActivate: [AuthCompanyAdminGuard] },
    { path: 'company-admin', component: CompanyAdminComponent, canActivate: [AuthCompanyAdminGuard], children: [
            {
                path: 'settings',
                component: SettingsComponent,
                pathMatch : 'full',
                canActivate: [AuthCompanyAdminGuard]
            },
            {
                path: 'dashboard',
                component: DashboardComponent,
                pathMatch : 'full',
                canActivate: [AuthCompanyAdminGuard]
            },
            {
                path: 'playground',
                component: ChatbotComponent,
                pathMatch : 'full',
                canActivate: [AuthCompanyAdminGuard]
            },
            {
                path: 'how-to-implement',
                component: HowToImplementComponent,
                pathMatch : 'full',
                canActivate: [AuthCompanyAdminGuard]
            },
            { path: '**', redirectTo: 'settings' }
        ]
    },
    { path: 'data-room', component: GaiaDataRoomComponent, pathMatch : 'full', canActivate: [AuthGaialabsCompanyGuard] },
    { path: 'recorder', component: RecorderComponent, pathMatch : 'full', canActivate: [AuthGaialabsCompanyGuard] },
    { path: 'lesson', component: LessonComponent, pathMatch : 'full', canActivate: [] },
    // { path: 'test', component: TestComponent, pathMatch : 'full' },
    // { path: 'test/:number', component: TestComponent, pathMatch : 'full' },
    { path: '**', redirectTo: '' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
