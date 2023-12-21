import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarChartComponent } from './bar-chart.component';
import {NgxEchartsModule} from "ngx-echarts";

describe('BarChartComponent', () => {
    let component: BarChartComponent;
    let fixture: ComponentFixture<BarChartComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NgxEchartsModule],
            declarations: [BarChartComponent]
        });
        fixture = TestBed.createComponent(BarChartComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
