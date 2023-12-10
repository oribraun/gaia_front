import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {HomeComponent} from "./components/home/home.component";
import {LoginComponent} from "./components/login/login.component";
import {AboutComponent} from "./components/about/about.component";
import {AuthGaialabsCompanyGuard} from "./guards/auth-gaialabs-company.guard";
import {LessonComponent} from "./components/lesson/lesson.component";
import {AuthGuard} from "./guards/auth.guard";
import {BuyComponent} from "./components/buy/buy.component";
import {OnBoardingComponent} from "./components/on-boarding/on-boarding.component";
import {AuthChildrenPlatformGuard} from "./guards/auth-children-platform.guard";
import {AuthTestPrepPlatformGuard} from "./guards/auth-test-prep-platform.guard";
import {PrivacyComponent} from "./components/privacy/privacy.component";

const routes: Routes = [
    { path: '', component: HomeComponent, pathMatch : 'full' },
    // { path: 'login', component: LoginComponent, pathMatch : 'full' },
    // { path: 'login/:type', component: LoginComponent, pathMatch : 'full' },
    { path: 'about', component: AboutComponent, pathMatch : 'full' },
    { path: 'privacy-policy', component: PrivacyComponent, pathMatch : 'full' },
    { path: 'onBoarding', component: OnBoardingComponent, pathMatch : 'full', canActivate: [AuthGuard] },

    // for children app only
    // {path: 'childrens', children: [
    //         { path: 'lesson/:lesson_id', component: LessonComponent, pathMatch : 'full' },
    //         { path: 'dashboard', component: ChildrensDashboardComponent, pathMatch : 'full' },
    //         { path: 'buy/:course_id', component: BuyComponent, pathMatch : 'full' },
    //     ],
    //     canActivate: [AuthChildrenPlatformGuard]
    // },
    {
        path: 'childrens',
        loadChildren: () => import('../childrens/childrens.module').then(m => m.ChildrensModule)
    },
    // for children app only

    // for ielts app only
    {
        path: 'ielts',
        loadChildren: () => import('../ielts/ielts.module').then(m => m.IeltsModule)
    },
    // for ielts app only

    // admin only for testing
    { path: 'lesson', component: LessonComponent, pathMatch : 'full', canActivate: [AuthGaialabsCompanyGuard] },
    // admin only for testing

    // { path: 'test', component: TestComponent, pathMatch : 'full' },
    // { path: 'test/:number', component: TestComponent, pathMatch : 'full' },
    { path: '**', redirectTo: '' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
