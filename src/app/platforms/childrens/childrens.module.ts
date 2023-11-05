import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChildrensRoutingModule } from './childrens-routing.module';
import {ChildrensDashboardComponent} from "./components/dashboard/dashboard.component";


@NgModule({
  declarations: [
      ChildrensDashboardComponent,
  ],
  imports: [
    CommonModule,
    ChildrensRoutingModule
  ]
})
export class ChildrensModule { }
