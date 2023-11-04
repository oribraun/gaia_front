import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChildrensRoutingModule } from './childrens-routing.module';
import {ChildrensDashboardComponent} from "./components/dashboard/dashboard.component";
import {CapitalizePipe} from "./pipes/capitalize/capitalize.pipe";


@NgModule({
  declarations: [
      ChildrensDashboardComponent,
      CapitalizePipe
  ],
  imports: [
    CommonModule,
    ChildrensRoutingModule
  ]
})
export class ChildrensModule { }
