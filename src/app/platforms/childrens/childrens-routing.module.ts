import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ChildrensDashboardComponent} from "./components/dashboard/dashboard.component";
import {LessonComponent} from "../main/components/lesson/lesson.component";
import {BuyComponent} from "../main/components/buy/buy.component";
import {AuthChildrenPlatformGuard} from "../main/guards/auth-children-platform.guard";
import {UserOnboardingGuard} from "./guards/on-boarding.guard";

const routes: Routes = [
    { path: 'dashboard', component: ChildrensDashboardComponent, pathMatch : 'full', canActivate: [AuthChildrenPlatformGuard, UserOnboardingGuard] },
    { path: 'lesson/:lesson_id', component: LessonComponent, pathMatch : 'full', canActivate: [AuthChildrenPlatformGuard, UserOnboardingGuard] },
    { path: 'buy/:course_id', component: BuyComponent, pathMatch : 'full', canActivate: [AuthChildrenPlatformGuard, UserOnboardingGuard] },
    { path: '**', redirectTo: 'dashboard'}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChildrensRoutingModule { }
