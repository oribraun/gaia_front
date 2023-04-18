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
import {DashboardComponent} from "./components/dashboard/dashboard.component";
import {PrivacyComponent} from "./components/privacy/privacy.component";
import {PlaygroundComponent} from "./components/playground/playground.component";
import {CompareVendorsComponent} from "./components/compare-vendors/compare-vendors.component";
import {PluginDashboardComponent} from "./components/plugin-dashboard/plugin-dashboard.component";
import {AuthCompanyAdminGuard} from "./guards/auth-company-admin.guard";
import {SettingsComponent} from "./components/settings/settings.component";
import {SmartRouterComponent} from "./components/smart-router/smart-router.component";

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
    { path: 'dashboard', component: DashboardComponent, pathMatch : 'full', canActivate: [AuthCompanyAdminGuard] },
    { path: 'settings', component: SettingsComponent, pathMatch : 'full', canActivate: [AuthCompanyAdminGuard] },
    { path: 'smart-router', component: SmartRouterComponent, pathMatch : 'full', canActivate: [AuthCompanyAdminGuard] },
    // { path: 'test', component: TestComponent, pathMatch : 'full' },
    // { path: 'test/:number', component: TestComponent, pathMatch : 'full' },
    { path: '**', redirectTo: '' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
