import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WordRepeaterComponent } from './word-repeater.component';
import {Config} from "../../../main/config";
import {LessonService} from "../../../main/services/lesson/lesson.service";
import {PresentationSlide} from "../../entities/presentation";

describe('WordRepeaterComponent', () => {
    let component: WordRepeaterComponent;
    let fixture: ComponentFixture<WordRepeaterComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [WordRepeaterComponent],
            providers: [Config, LessonService]
        });
        fixture = TestBed.createComponent(WordRepeaterComponent);
        component = fixture.componentInstance;
        component.currentSlide = new PresentationSlide();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
