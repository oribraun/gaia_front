import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmbedGameComponent } from './embed-game.component';
import {Config} from "../../../main/config";
import {LessonService} from "../../../main/services/lesson/lesson.service";
import {PresentationSlide} from "../../entities/presentation";

describe('EmbedGameComponent', () => {
    let component: EmbedGameComponent;
    let fixture: ComponentFixture<EmbedGameComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [EmbedGameComponent],
            providers: [Config, LessonService]
        });
        fixture = TestBed.createComponent(EmbedGameComponent);
        component = fixture.componentInstance;
        component.currentSlide = new PresentationSlide();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
