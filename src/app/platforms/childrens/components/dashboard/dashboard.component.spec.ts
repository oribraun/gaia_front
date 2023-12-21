import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChildrensDashboardComponent } from './dashboard.component';
import {Config} from "../../../main/config";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {ActivatedRoute, convertToParamMap} from "@angular/router";
import {of} from "rxjs";

describe('DashboardComponent', () => {
    let component: ChildrensDashboardComponent;
    let fixture: ComponentFixture<ChildrensDashboardComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [ChildrensDashboardComponent],
            providers: [Config, {
                provide: ActivatedRoute,
                useValue: {
                    queryParams: of(convertToParamMap({ type: 'in_progress' })) // Provide any route parameter values you need for testing
                }
            }]
        });
        fixture = TestBed.createComponent(ChildrensDashboardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
