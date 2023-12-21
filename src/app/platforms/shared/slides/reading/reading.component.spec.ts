import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReadingComponent } from './reading.component';
import {Config} from "../../../main/config";
import {LessonService} from "../../../main/services/lesson/lesson.service";
import {PresentationSlide} from "../../entities/presentation";

describe('ReadingComponent', () => {
    let component: ReadingComponent;
    let fixture: ComponentFixture<ReadingComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ReadingComponent],
            providers: [Config, LessonService]
        });
        fixture = TestBed.createComponent(ReadingComponent);
        component = fixture.componentInstance;
        component.currentSlide = new PresentationSlide();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
