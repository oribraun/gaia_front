import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GreetingComponent } from './greeting.component';
import {Config} from "../../../main/config";
import {LessonService} from "../../../main/services/lesson/lesson.service";
import {PresentationSlide} from "../../entities/presentation";

describe('GreetingComponent', () => {
    let component: GreetingComponent;
    let fixture: ComponentFixture<GreetingComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [GreetingComponent],
            providers: [Config, LessonService]
        });
        fixture = TestBed.createComponent(GreetingComponent);
        component = fixture.componentInstance;
        component.currentSlide = new PresentationSlide();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
