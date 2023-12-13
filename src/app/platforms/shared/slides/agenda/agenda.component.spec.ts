import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgendaComponent } from './agenda.component';
import {Config} from "../../../main/config";
import {LessonService} from "../../../main/services/lesson/lesson.service";
import {PresentationSlide} from "../../entities/presentation";

describe('AgendaComponent', () => {
    let component: AgendaComponent;
    let fixture: ComponentFixture<AgendaComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [AgendaComponent],
            providers: [Config, LessonService]
        });
        fixture = TestBed.createComponent(AgendaComponent);
        component = fixture.componentInstance;
        component.currentSlide = new PresentationSlide();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
