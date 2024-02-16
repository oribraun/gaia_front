import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KitDashboardComponent } from './kit-dashboard.component';
import {TranslateModule} from "@ngx-translate/core";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {HelperService} from "../../../main/services/helper.service";
import {ApiService} from "../../../main/services/api.service";
import {Config} from "../../../main/config";
import {ActivatedRoute, convertToParamMap} from "@angular/router";
import {of} from "rxjs";

describe('KitDashboardComponent', () => {
    let component: KitDashboardComponent;
    let fixture: ComponentFixture<KitDashboardComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, TranslateModule.forRoot()],
            declarations: [KitDashboardComponent],
            providers: [
                HelperService,
                ApiService,
                Config, {
                provide: ActivatedRoute,
                useValue: {
                    paramMap: of(convertToParamMap({ })) // Provide any route parameter values you need for testing
                }
            }]
        })
            .compileComponents();

        fixture = TestBed.createComponent(KitDashboardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
