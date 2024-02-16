import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LessonsEditComponent } from './lessons-edit.component';
import {TranslateModule} from "@ngx-translate/core";
import {ApiService} from "../../../main/services/api.service";
import {AlertService} from "../../../main/services/alert.service";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {Config} from "../../../main/config";

describe('LessonsEditComponent', () => {
    let component: LessonsEditComponent;
    let fixture: ComponentFixture<LessonsEditComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, TranslateModule.forRoot()],
            declarations: [LessonsEditComponent],
            providers: [ApiService, AlertService, Config]
        })
            .compileComponents();

        fixture = TestBed.createComponent(LessonsEditComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
