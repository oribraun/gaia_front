import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewComponent } from './review.component';
import {Config} from "../../../main/config";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {ActivatedRoute, convertToParamMap} from "@angular/router";
import {of} from "rxjs";

describe('ReviewComponent', () => {
    let component: ReviewComponent;
    let fixture: ComponentFixture<ReviewComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [ReviewComponent],
            providers: [Config, {
                provide: ActivatedRoute,
                useValue: {
                    queryParams: of(convertToParamMap({ })) // Provide any route parameter values you need for testing
                }
            }]
        });
        fixture = TestBed.createComponent(ReviewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
