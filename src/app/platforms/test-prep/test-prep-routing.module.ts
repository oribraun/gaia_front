import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {DashboardComponent} from "./components/dashboard/dashboard.component";
import {PracticeLessonComponent} from "./components/practice-lesson/practice-lesson.component";
import {VocabularyComponent} from "./components/vocabulary/vocabulary.component";

const routes: Routes = [
    { path: 'dashboard', component: DashboardComponent, pathMatch : 'full' },
    { path: 'practice/:id', component: PracticeLessonComponent, pathMatch : 'full' },
    { path: 'vocabulary', component: VocabularyComponent, pathMatch : 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TestPrepRoutingModule { }
