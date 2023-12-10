import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {DashboardComponent} from "./components/dashboard/dashboard.component";
import {PracticeLessonComponent} from "./components/practice-lesson/practice-lesson.component";
import {VocabularyComponent} from "./components/vocabulary/vocabulary.component";
import {ReviewComponent} from "./components/review/review.component";
import {UserOnboardingGuard} from "./components/guards/on-boarding.guard";
import {PlanComponent} from "./components/plan/plan.component";
import {AuthTestPrepPlatformGuard} from "../main/guards/auth-test-prep-platform.guard";

const routes: Routes = [
    { path: 'dashboard', component: DashboardComponent, pathMatch : 'full', canActivate: [AuthTestPrepPlatformGuard, UserOnboardingGuard]},
    { path: 'plans', component: PlanComponent, pathMatch : 'full'},
    { path: 'practice/:id', component: PracticeLessonComponent, pathMatch : 'full', canActivate: [AuthTestPrepPlatformGuard, UserOnboardingGuard] },
    { path: 'vocabulary', component: VocabularyComponent, pathMatch : 'full', canActivate: [AuthTestPrepPlatformGuard, UserOnboardingGuard] },
    { path: 'review', component: ReviewComponent, pathMatch : 'full', canActivate: [AuthTestPrepPlatformGuard, UserOnboardingGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IeltsRoutingModule { }
