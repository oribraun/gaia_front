import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhiteBoardComponent } from './white-board.component';
import {Config} from "../../../config";
import {ApiService} from "../../../services/api.service";
import {LessonService} from "../../../services/lesson/lesson.service";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {PresentationSlide} from "../../../../shared/entities/presentation";

describe('WhiteBoardComponent', () => {
    let component: WhiteBoardComponent;
    let fixture: ComponentFixture<WhiteBoardComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [WhiteBoardComponent],
            providers: [Config, ApiService, LessonService]
        });
        fixture = TestBed.createComponent(WhiteBoardComponent);
        component = fixture.componentInstance;
        component.currentSlide = new PresentationSlide();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
