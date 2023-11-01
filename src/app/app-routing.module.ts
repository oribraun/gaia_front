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
import {ChildrensDashboardComponent} from "./components/platforms/childrens/dashboard/dashboard.component";
import {TestPrepDashboardComponent} from "./components/platforms/test_prep/dashboard/dashboard.component";

const routes: Routes = [
    { path: '', component: HomeComponent, pathMatch : 'full' },
    // { path: 'login', component: LoginComponent, pathMatch : 'full' },
    // { path: 'login/:type', component: LoginComponent, pathMatch : 'full' },
    { path: 'about', component: AboutComponent, pathMatch : 'full' },
    { path: 'onBoarding', component: OnBoardingComponent, pathMatch : 'full', canActivate: [AuthGuard] },

    // for children app only
    {path: 'childrens', children: [
            { path: 'lesson/:lesson_id', component: LessonComponent, pathMatch : 'full' },
            { path: 'dashboard', component: ChildrensDashboardComponent, pathMatch : 'full' },
            { path: 'buy/:course_id', component: BuyComponent, pathMatch : 'full' },
        ],
        canActivate: [AuthChildrenPlatformGuard]
    },
    // for children app only

    // for test_prep app only
    {path: 'test_prep', children: [
            { path: 'dashboard', component: TestPrepDashboardComponent, pathMatch : 'full' },
        ],
        canActivate: [AuthTestPrepPlatformGuard]
    },
    // for test_prep app only

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
