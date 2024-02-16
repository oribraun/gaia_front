import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnseenComponent } from './unseen.component';
import {Config} from "../../../main/config";
import {LessonService} from "../../../main/services/lesson/lesson.service";
import {PresentationSlide} from "../../entities/presentation";
import {SafeHtmlPipe} from "../../pipes/safe-html.pipe";
import {TranslateModule} from "@ngx-translate/core";

describe('UnseenComponent', () => {
    let component: UnseenComponent;
    let fixture: ComponentFixture<UnseenComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot({})],
            declarations: [UnseenComponent, SafeHtmlPipe],
            providers: [Config, LessonService]
        });
        fixture = TestBed.createComponent(UnseenComponent);
        component = fixture.componentInstance;
        component.currentSlide = new PresentationSlide();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
