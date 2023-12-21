import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnBoardingComponent } from './on-boarding.component';
import {Config} from "../../config";
import {ApiService} from "../../services/api.service";
import {Router} from "@angular/router";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {PrivacyComponent} from "../privacy/privacy.component";

describe('OnBoardingComponent', () => {
    let component: OnBoardingComponent;
    let fixture: ComponentFixture<OnBoardingComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [OnBoardingComponent, PrivacyComponent],
            providers: [Config, ApiService, Router]
        });
        fixture = TestBed.createComponent(OnBoardingComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
