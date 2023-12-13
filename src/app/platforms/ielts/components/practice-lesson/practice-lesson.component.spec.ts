import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PracticeLessonComponent } from './practice-lesson.component';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {Config} from "../../../main/config";
import {ActivatedRoute, convertToParamMap} from "@angular/router";
import {of} from "rxjs";

describe('PracticeLessonComponent', () => {
    let component: PracticeLessonComponent;
    let fixture: ComponentFixture<PracticeLessonComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [PracticeLessonComponent],
            providers: [Config, {
                provide: ActivatedRoute,
                useValue: {
                    paramMap: of(convertToParamMap({ id: 1 })), // Provide any route parameter values you need for testing
                    queryParams: of(convertToParamMap({ q_id: 1 })) // Provide any route parameter values you need for testing
                }
            }]
        });
        fixture = TestBed.createComponent(PracticeLessonComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
