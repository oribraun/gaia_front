import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpComponent } from './help.component';
import {Config} from "../../../../config";
import {LessonService} from "../../../../services/lesson/lesson.service";
import {SpeechRecognitionService} from "../../../../services/speech-recognition/speech-recognition.service";

describe('HelpComponent', () => {
    let component: HelpComponent;
    let fixture: ComponentFixture<HelpComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [HelpComponent],
            providers: [Config, LessonService, SpeechRecognitionService]
        });
        fixture = TestBed.createComponent(HelpComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
