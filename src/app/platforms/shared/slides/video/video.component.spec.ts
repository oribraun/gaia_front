import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoComponent } from './video.component';
import {Config} from "../../../main/config";
import {LessonService} from "../../../main/services/lesson/lesson.service";
import {PresentationSlide} from "../../entities/presentation";

describe('VideoComponent', () => {
    let component: VideoComponent;
    let fixture: ComponentFixture<VideoComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [VideoComponent],
            providers: [Config, LessonService]
        });
        fixture = TestBed.createComponent(VideoComponent);
        component = fixture.componentInstance;
        component.currentSlide = new PresentationSlide();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
