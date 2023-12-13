import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoIeltsComponent } from './video-ielts.component';
import {Config} from "../../../main/config";
import {LessonService} from "../../../main/services/lesson/lesson.service";
import {PresentationSlide} from "../../entities/presentation";
import {FormsModule} from "@angular/forms";

describe('VideoIeltsComponent', () => {
    let component: VideoIeltsComponent;
    let fixture: ComponentFixture<VideoIeltsComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule],
            declarations: [VideoIeltsComponent],
            providers: [Config, LessonService]
        });
        fixture = TestBed.createComponent(VideoIeltsComponent);
        component = fixture.componentInstance;
        component.currentSlide = new PresentationSlide();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
