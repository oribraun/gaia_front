import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ChildrensDashboardComponent} from "./components/dashboard/dashboard.component";
import {LessonComponent} from "../main/components/lesson/lesson.component";
import {BuyComponent} from "../main/components/buy/buy.component";
import {AuthChildrenPlatformGuard} from "../main/guards/auth-children-platform.guard";

const routes: Routes = [
    { path: 'dashboard', component: ChildrensDashboardComponent, pathMatch : 'full', canActivate: [AuthChildrenPlatformGuard] },
    { path: 'lesson/:lesson_id', component: LessonComponent, pathMatch : 'full', canActivate: [AuthChildrenPlatformGuard] },
    { path: 'buy/:course_id', component: BuyComponent, pathMatch : 'full', canActivate: [AuthChildrenPlatformGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChildrensRoutingModule { }
