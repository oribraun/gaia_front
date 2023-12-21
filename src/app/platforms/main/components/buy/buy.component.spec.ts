import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuyComponent } from './buy.component';
import {Config} from "../../config";
import {ApiService} from "../../services/api.service";
import {ActivatedRoute, convertToParamMap} from "@angular/router";
import {of} from "rxjs";
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('BuyComponent', () => {
    let component: BuyComponent;
    let fixture: ComponentFixture<BuyComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [BuyComponent],
            providers: [Config, ApiService, {
                provide: ActivatedRoute,
                useValue: {
                    paramMap: of(convertToParamMap({ course_id: '1' })) // Provide any route parameter values you need for testing
                }
            }]
        });
        fixture = TestBed.createComponent(BuyComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
