import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KitBaseComponent } from './kit-base.component';
import {TranslateModule} from "@ngx-translate/core";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {ApiService} from "../../../main/services/api.service";
import {HelperService} from "../../../main/services/helper.service";
import {Config} from "../../../main/config";
import {RouterTestingModule} from "@angular/router/testing";

describe('KitBaseComponent', () => {
    let component: KitBaseComponent;
    let fixture: ComponentFixture<KitBaseComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                RouterTestingModule,
                HttpClientTestingModule,
                TranslateModule.forRoot()
            ],
            declarations: [KitBaseComponent],
            providers: [ApiService, HelperService, Config]
        })
            .compileComponents();

        fixture = TestBed.createComponent(KitBaseComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
