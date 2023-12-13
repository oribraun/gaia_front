import { TestBed } from '@angular/core/testing';

import { GeneralService } from './general.service';
import {ApiService} from "../../../main/services/api.service";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {Config} from "../../../main/config";

describe('GeneralService', () => {
  let service: GeneralService;

  beforeEach(() => {
    TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [ApiService, Config]
    });
    service = TestBed.inject(GeneralService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
