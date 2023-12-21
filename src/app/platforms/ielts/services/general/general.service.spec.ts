import {fakeAsync, TestBed} from '@angular/core/testing';

import { GeneralService } from './general.service';
import {ApiService} from "../../../main/services/api.service";
import {HttpClientTestingModule, HttpTestingController} from "@angular/common/http/testing";
import {Config} from "../../../main/config";

describe('GeneralService', () => {
    let service: GeneralService;
    let api_service: ApiService;
    let httpTestingController: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [ApiService, Config]
        });
        service = TestBed.inject(GeneralService);
        api_service = TestBed.inject(ApiService);
        httpTestingController = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        // After each test, verify that there are no outstanding HTTP requests
        // httpTestingController.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('generateNewLesson', fakeAsync(() => {
        service.generateNewLesson(-1, -1).then((result) => {
            // Check that the response matches the expected data
            expect(result).toEqual(1);
        });

        const url = api_service.serverBase + api_service.baseApi + 'ielts/us/get-user-new-lesson';
        const req = httpTestingController.expectOne({
            method: 'POST',
            url: `${url}`
        });

        req.flush({id: 1});

        httpTestingController.verify();
    }));
});
