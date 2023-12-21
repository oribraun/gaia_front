import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenBoardComponent } from './screen-board.component';
import {Config} from "../../../config";
import {ApiService} from "../../../services/api.service";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {ChatBoardComponent} from "../chat-board/chat-board.component";
import {WhiteBoardComponent} from "../white-board/white-board.component";

describe('ScreenBoardComponent', () => {
    let component: ScreenBoardComponent;
    let fixture: ComponentFixture<ScreenBoardComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [ScreenBoardComponent, ChatBoardComponent, WhiteBoardComponent],
            providers: [Config, ApiService]
        });
        fixture = TestBed.createComponent(ScreenBoardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
