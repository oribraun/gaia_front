import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeakingComponent } from './speaking.component';
import {Config} from "../../../main/config";
import {LessonService} from "../../../main/services/lesson/lesson.service";
import {PresentationSlide} from "../../entities/presentation";

describe('SpeakingComponent', () => {
    let component: SpeakingComponent;
    let fixture: ComponentFixture<SpeakingComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [SpeakingComponent],
            providers: [Config, LessonService]
        });
        fixture = TestBed.createComponent(SpeakingComponent);
        component = fixture.componentInstance;
        component.currentSlide = new PresentationSlide();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
