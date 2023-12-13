import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChildrensRoutingModule } from './childrens-routing.module';
import {ChildrensDashboardComponent} from "./components/dashboard/dashboard.component";
import {SharedModule} from "../shared/shared.module";


@NgModule({
  declarations: [
      ChildrensDashboardComponent
  ],
    imports: [
        CommonModule,
        ChildrensRoutingModule,
        SharedModule
    ]
})
export class ChildrensModule { }
