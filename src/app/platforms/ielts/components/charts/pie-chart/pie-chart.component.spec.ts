import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PieChartComponent } from './pie-chart.component';
import {NgxEchartsModule} from "ngx-echarts";

describe('PieChartComponent', () => {
    let component: PieChartComponent;
    let fixture: ComponentFixture<PieChartComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NgxEchartsModule],
            declarations: [PieChartComponent]
        });
        fixture = TestBed.createComponent(PieChartComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
