import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateComponent } from './template.component';
import {Config} from "../../../main/config";
import {LessonService} from "../../../main/services/lesson/lesson.service";
import {PresentationSlide} from "../../entities/presentation";

describe('TemplateComponent', () => {
    let component: TemplateComponent;
    let fixture: ComponentFixture<TemplateComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [TemplateComponent],
            providers: [Config, LessonService]
        });
        fixture = TestBed.createComponent(TemplateComponent);
        component = fixture.componentInstance;
        component.currentSlide = new PresentationSlide();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
