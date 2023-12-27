import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardComponent } from './dashboard.component';
import {Config} from "../../../main/config";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {ActivatedRoute, convertToParamMap} from "@angular/router";
import {of} from "rxjs";
import { TranslateModule } from "@ngx-translate/core";

describe('DashboardComponent', () => {
    let component: DashboardComponent;
    let fixture: ComponentFixture<DashboardComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, TranslateModule.forRoot()],
            declarations: [DashboardComponent],
            providers: [
                Config, {
                    provide: ActivatedRoute,
                    useValue: {
                        queryParams: of(convertToParamMap({ })), // Provide any route parameter values you need for testing
                        paramMap: of(convertToParamMap({ })) // Provide any route parameter values you need for testing
                    }
                }
            ]
        });
        fixture = TestBed.createComponent(DashboardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
