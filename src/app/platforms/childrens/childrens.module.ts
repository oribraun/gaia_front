import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChildrensRoutingModule } from './childrens-routing.module';
import {ChildrensDashboardComponent} from "./components/dashboard/dashboard.component";
import {SharedSlidesModule} from "../shared-slides/shared-slides.module";


@NgModule({
  declarations: [
      ChildrensDashboardComponent
  ],
    imports: [
        CommonModule,
        ChildrensRoutingModule,
        SharedSlidesModule
    ]
})
export class ChildrensModule { }
