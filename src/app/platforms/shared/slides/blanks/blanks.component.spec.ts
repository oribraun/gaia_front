import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlanksComponent } from './blanks.component';
import {Config} from "../../../main/config";
import {LessonService} from "../../../main/services/lesson/lesson.service";
import {PresentationSlide} from "../../entities/presentation";

describe('BlanksComponent', () => {
    let component: BlanksComponent;
    let fixture: ComponentFixture<BlanksComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [BlanksComponent],
            providers: [Config, LessonService]
        });
        fixture = TestBed.createComponent(BlanksComponent);
        component = fixture.componentInstance;
        component.currentSlide = new PresentationSlide();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
