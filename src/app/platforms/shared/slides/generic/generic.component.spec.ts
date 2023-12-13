import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericComponent } from './generic.component';
import {Config} from "../../../main/config";
import {LessonService} from "../../../main/services/lesson/lesson.service";
import {PresentationSlide} from "../../entities/presentation";

describe('GenericComponent', () => {
    let component: GenericComponent;
    let fixture: ComponentFixture<GenericComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [GenericComponent],
            providers: [Config, LessonService]
        });
        fixture = TestBed.createComponent(GenericComponent);
        component = fixture.componentInstance;
        component.currentSlide = new PresentationSlide();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
