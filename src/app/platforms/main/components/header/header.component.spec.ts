import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderComponent } from './header.component';
import {Config} from "../../config";
import {ApiService} from "../../services/api.service";
import {ActivatedRoute, convertToParamMap, Router, RouterModule} from "@angular/router";
import {HelperService} from "../../services/helper.service";
import {ChangeDetectorRef, NgZone} from "@angular/core";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {of} from "rxjs";
import {AlertComponent} from "../alert/alert.component";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";
import {FormsModule} from "@angular/forms";
import {TranslateModule} from "@ngx-translate/core";

describe('HeaderComponent', () => {
    let component: HeaderComponent;
    let fixture: ComponentFixture<HeaderComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, NoopAnimationsModule, FormsModule, RouterModule.forRoot([]), TranslateModule.forRoot()],
            declarations: [HeaderComponent, AlertComponent],
            providers: [
                Config,
                ApiService,
                Router,
                HelperService,
                ChangeDetectorRef,
                {
                    provide: ActivatedRoute,
                    useValue: {
                        queryParams: of(convertToParamMap({ authType: 'login' })) // Provide any route parameter values you need for testing
                    }
                }
            ]
        });
        fixture = TestBed.createComponent(HeaderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
