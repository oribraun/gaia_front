import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ChildrensDashboardComponent} from "./components/dashboard/dashboard.component";
import {LessonComponent} from "../main/components/lesson/lesson.component";
import {BuyComponent} from "../main/components/buy/buy.component";

const routes: Routes = [
    { path: 'dashboard', component: ChildrensDashboardComponent, pathMatch : 'full' },
    { path: 'lesson/:lesson_id', component: LessonComponent, pathMatch : 'full' },
    { path: 'buy/:course_id', component: BuyComponent, pathMatch : 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChildrensRoutingModule { }
