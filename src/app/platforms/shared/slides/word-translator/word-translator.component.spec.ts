import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WordTranslatorComponent } from './word-translator.component';
import {Config} from "../../../main/config";
import {LessonService} from "../../../main/services/lesson/lesson.service";
import {PresentationSlide} from "../../entities/presentation";

describe('WordTranslatorComponent', () => {
    let component: WordTranslatorComponent;
    let fixture: ComponentFixture<WordTranslatorComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [WordTranslatorComponent],
            providers: [Config, LessonService]
        });
        fixture = TestBed.createComponent(WordTranslatorComponent);
        component = fixture.componentInstance;
        component.currentSlide = new PresentationSlide();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
