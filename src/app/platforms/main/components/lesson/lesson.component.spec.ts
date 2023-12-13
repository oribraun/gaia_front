import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LessonComponent } from './lesson.component';
import {ApiService} from "../../services/api.service";
import {Config} from "../../config";
import {AnimationsService} from "../../services/animations/animations.service";
import {SpeechRecognitionService} from "../../services/speech-recognition/speech-recognition.service";
import {
    SocketSpeechRecognitionService
} from "../../services/socket-speech-recognition/socket-speech-recognition.service";
import {LessonService} from "../../services/lesson/lesson.service";
import {SpeechRecognitionEnhancerService} from "../../services/speech-recognition/speech-recognition-enhancer.service";
import {SocketRecorderService} from "../../services/socket-recorder/socket-recorder.service";
import {ActivatedRoute, convertToParamMap, Router} from "@angular/router";
import {of} from "rxjs";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {PanelBoardComponent} from "./panel-board/panel-board.component";
import {ScreenBoardComponent} from "./screen-board/screen-board.component";
import {ChatBoardComponent} from "./chat-board/chat-board.component";
import {PresentationSection} from "../../../shared/entities/presentation";
import {NO_ERRORS_SCHEMA} from "@angular/core";

describe('LessonComponent', () => {
    let component: LessonComponent;
    let fixture: ComponentFixture<LessonComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [ LessonComponent, PanelBoardComponent, ScreenBoardComponent, ChatBoardComponent ],
            schemas: [NO_ERRORS_SCHEMA],
            providers: [
                ApiService,
                Config,
                AnimationsService,
                SpeechRecognitionService,
                SocketSpeechRecognitionService,
                LessonService,
                SpeechRecognitionEnhancerService,
                SocketRecorderService,
                Router,
                {
                    provide: ActivatedRoute,
                    useValue: {
                        paramMap: of(convertToParamMap({ lesson_id: 1 })) // Provide any route parameter values you need for testing
                    }
                }
            ]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LessonComponent);
        component = fixture.componentInstance;
        component.currentSection = new PresentationSection();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
