import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RandomSelectorComponent } from './random-selector.component';
import {Config} from "../../../main/config";
import {LessonService} from "../../../main/services/lesson/lesson.service";
import {PresentationSlide} from "../../entities/presentation";

describe('RandomSelectorComponent', () => {
    let component: RandomSelectorComponent;
    let fixture: ComponentFixture<RandomSelectorComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [RandomSelectorComponent],
            providers: [Config, LessonService]
        });
        fixture = TestBed.createComponent(RandomSelectorComponent);
        component = fixture.componentInstance;
        component.currentSlide = new PresentationSlide();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
