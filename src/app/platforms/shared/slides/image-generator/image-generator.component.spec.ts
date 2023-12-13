import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageGeneratorComponent } from './image-generator.component';
import {Config} from "../../../main/config";
import {LessonService} from "../../../main/services/lesson/lesson.service";
import {PresentationSlide} from "../../entities/presentation";
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('ImageGeneratorComponent', () => {
    let component: ImageGeneratorComponent;
    let fixture: ComponentFixture<ImageGeneratorComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [ImageGeneratorComponent],
            providers: [Config, LessonService]
        });
        fixture = TestBed.createComponent(ImageGeneratorComponent);
        component = fixture.componentInstance;
        component.currentSlide = new PresentationSlide();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
