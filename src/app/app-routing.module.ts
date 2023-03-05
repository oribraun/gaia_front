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

const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch : 'full' },
  { path: 'login', component: LoginComponent, pathMatch : 'full' },
  { path: 'login/:type', component: LoginComponent, pathMatch : 'full' },
  { path: 'about', component: AboutComponent, pathMatch : 'full' },
  { path: 'prompt-optimizer', component: PromptOptimizerComponent, pathMatch : 'full', canActivate: [AuthGuard]},
  { path: 'prompt-optimizer2', component: PromptOptimizerComponent, pathMatch : 'full'},
  { path: 'analyzer', component: AnalyzerComponent, pathMatch : 'full', canActivate: [AuthGuard] },
  { path: 'dashboard', component: DashboardComponent, pathMatch : 'full', canActivate: [AuthGuard] },
  // { path: 'test', component: TestComponent, pathMatch : 'full' },
  // { path: 'test/:number', component: TestComponent, pathMatch : 'full' },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
