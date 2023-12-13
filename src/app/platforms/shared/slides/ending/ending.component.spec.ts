import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EndingComponent } from './ending.component';
import {Config} from "../../../main/config";
import {LessonService} from "../../../main/services/lesson/lesson.service";
import {PresentationSlide} from "../../entities/presentation";

describe('EndingComponent', () => {
    let component: EndingComponent;
    let fixture: ComponentFixture<EndingComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [EndingComponent],
            providers: [Config, LessonService]
        });
        fixture = TestBed.createComponent(EndingComponent);
        component = fixture.componentInstance;
        component.currentSlide = new PresentationSlide();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
