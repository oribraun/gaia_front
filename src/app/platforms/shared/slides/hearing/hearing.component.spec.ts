import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HearingComponent } from './hearing.component';
import {Config} from "../../../main/config";
import {LessonService} from "../../../main/services/lesson/lesson.service";
import {PresentationSlide} from "../../entities/presentation";
import {FormsModule} from "@angular/forms";

describe('HearingComponent', () => {
    let component: HearingComponent;
    let fixture: ComponentFixture<HearingComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule],
            declarations: [HearingComponent],
            providers: [Config, LessonService]
        });
        fixture = TestBed.createComponent(HearingComponent);
        component = fixture.componentInstance;
        component.currentSlide = new PresentationSlide();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
