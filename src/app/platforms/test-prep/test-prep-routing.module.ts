import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {TestPrepDashboardComponent} from "./components/dashboard/dashboard.component";
import {PracticeLessonComponent} from "./components/practice-lesson/practice-lesson.component";

const routes: Routes = [
    { path: 'dashboard', component: TestPrepDashboardComponent, pathMatch : 'full' },
    { path: 'practice/:id', component: PracticeLessonComponent, pathMatch : 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TestPrepRoutingModule { }
