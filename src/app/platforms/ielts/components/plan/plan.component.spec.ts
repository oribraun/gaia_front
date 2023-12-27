import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanComponent } from './plan.component';
import {Config} from "../../../main/config";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {ActivatedRoute, convertToParamMap} from "@angular/router";
import {of} from "rxjs";

describe('PlanComponent', () => {
    let component: PlanComponent;
    let fixture: ComponentFixture<PlanComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [PlanComponent],
            providers: [Config, {
                provide: ActivatedRoute,
                useValue: {
                    paramMap: of(convertToParamMap({ })) // Provide any route parameter values you need for testing
                }
            }]
        });
        fixture = TestBed.createComponent(PlanComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
