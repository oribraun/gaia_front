import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {HomeComponent} from "./components/home/home.component";
import {LoginComponent} from "./components/login/login.component";
import {AboutComponent} from "./components/about/about.component";
import {AuthGaialabsCompanyGuard} from "./guards/auth-gaialabs-company.guard";
import {LessonComponent} from "./components/lesson/lesson.component";
import {AuthGuard} from "./guards/auth.guard";
import {DashboardComponent} from "./components/dashboard/dashboard.component";

const routes: Routes = [
    { path: '', component: HomeComponent, pathMatch : 'full' },
    { path: 'login', component: LoginComponent, pathMatch : 'full' },
    { path: 'login/:type', component: LoginComponent, pathMatch : 'full' },
    { path: 'about', component: AboutComponent, pathMatch : 'full' },
    { path: 'lesson', component: LessonComponent, pathMatch : 'full', canActivate: [AuthGaialabsCompanyGuard] },
    { path: 'lesson/:lesson_id', component: LessonComponent, pathMatch : 'full', canActivate: [AuthGuard] },
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
