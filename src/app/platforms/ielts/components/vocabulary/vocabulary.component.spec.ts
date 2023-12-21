import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VocabularyComponent } from './vocabulary.component';
import {Config} from "../../../main/config";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {ActivatedRoute, convertToParamMap} from "@angular/router";
import {of} from "rxjs";

describe('VocabularyComponent', () => {
    let component: VocabularyComponent;
    let fixture: ComponentFixture<VocabularyComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [VocabularyComponent],
            providers: [Config, {
                provide: ActivatedRoute,
                useValue: {
                    queryParams: of(convertToParamMap({ })) // Provide any route parameter values you need for testing
                }
            }]
        });
        fixture = TestBed.createComponent(VocabularyComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
