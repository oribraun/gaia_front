import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WritingComponent } from './writing.component';
import {Config} from "../../../main/config";
import {LessonService} from "../../../main/services/lesson/lesson.service";
import {PresentationSlide} from "../../entities/presentation";
import {FormsModule} from "@angular/forms";

describe('WritingComponent', () => {
    let component: WritingComponent;
    let fixture: ComponentFixture<WritingComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule],
            declarations: [WritingComponent],
            providers: [Config, LessonService]
        });
        fixture = TestBed.createComponent(WritingComponent);
        component = fixture.componentInstance;
        component.currentSlide = new PresentationSlide();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
