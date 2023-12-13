import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelBoardComponent } from './panel-board.component';
import {Config} from "../../../config";
import {AnimationsService} from "../../../services/animations/animations.service";
import {LessonService} from "../../../services/lesson/lesson.service";
import {HelpComponent} from "./help/help.component";

describe('PanelBoardComponent', () => {
    let component: PanelBoardComponent;
    let fixture: ComponentFixture<PanelBoardComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [PanelBoardComponent, HelpComponent],
            providers: [Config, AnimationsService, LessonService]
        });
        fixture = TestBed.createComponent(PanelBoardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
