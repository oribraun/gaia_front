import {fakeAsync, TestBed} from '@angular/core/testing';

import { ApiService } from './api.service';
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {Config} from "../config";

describe('ApiService', () => {
    let api_service: ApiService;
    let httpTestingController: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [Config]
        });
        api_service = TestBed.inject(ApiService);
        httpTestingController = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        // After each test, verify that there are no outstanding HTTP requests
        httpTestingController.verify();
    });

    it('getPlatforms', fakeAsync(() => {
        api_service.getPlatforms({}).subscribe((result: any) => {
            // Check that the response matches the expected data
            expect(result.platforms).toEqual([]);
        });

        const url = api_service.serverBase + api_service.baseApiPublic + 'get-platforms';
        const req = httpTestingController.expectOne({
            method: 'POST',
            url: `${url}`
        });

        req.flush({platforms: []});
    }));

    it('should be created', () => {
        expect(api_service).toBeTruthy();
    });
});
