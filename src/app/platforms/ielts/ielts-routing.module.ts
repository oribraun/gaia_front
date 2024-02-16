import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {DashboardComponent} from "./components/dashboard/dashboard.component";
import {PracticeLessonComponent} from "./components/practice-lesson/practice-lesson.component";
import {VocabularyComponent} from "./components/vocabulary/vocabulary.component";
import {ReviewComponent} from "./components/review/review.component";
import {UserOnboardingGuard} from "./guards/on-boarding.guard";
import {PlanComponent} from "./components/plan/plan.component";
import {AuthIeltsPlatformGuard} from "../main/guards/auth-ielts-platform.guard";
import {HomeComponent} from "./components/home/home.component";
import {KitDashboardComponent} from "./components/kit-dashboard/kit-dashboard.component";
import {KitBaseComponent} from "./components/kit-base/kit-base.component";

import {LessonsEditComponent} from "./teacher_admin/lessons-edit/lessons-edit.component";
import {AuthTeacherGuard} from "./guards/auth-teacher.guard";

const routes: Routes = [
    { path: 'home', component: HomeComponent, pathMatch : 'full', canActivate: [AuthIeltsPlatformGuard]},
    // { path: 'dashboard', component: DashboardComponent, pathMatch : 'full', canActivate: [AuthIeltsPlatformGuard]},
    // { path: 'plans', component: PlanComponent, pathMatch : 'full'},
    // { path: 'practice/:id', component: PracticeLessonComponent, pathMatch : 'full', canActivate: [AuthIeltsPlatformGuard] },
    // { path: 'vocabulary', component: VocabularyComponent, pathMatch : 'full', canActivate: [AuthIeltsPlatformGuard] },
    // { path: 'review', component: ReviewComponent, pathMatch : 'full', canActivate: [AuthIeltsPlatformGuard] },
    { path: 'kit/:id', component: KitBaseComponent, children: [
        { path: 'dashboard', component: KitDashboardComponent, pathMatch : 'full'},
        { path: 'practice/:id', component: PracticeLessonComponent, pathMatch : 'full'}
        ], canActivate: [AuthIeltsPlatformGuard]
    },
    { path: '**', redirectTo: 'dashboard'},
    { path: 'teacher-admin', children: [
        { path: 'main', component: LessonsEditComponent, pathMatch : 'full'},
        { path: '**', redirectTo: 'main'}
        ], canActivate: [AuthIeltsPlatformGuard, AuthTeacherGuard]
    }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IeltsRoutingModule { }
