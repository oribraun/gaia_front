import { TestBed } from '@angular/core/testing';

import { SocketRecorderService } from './socket-recorder.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {Config} from "../../config";

describe('SocketSpeechRecognitionService', () => {
  let service: SocketRecorderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [Config]
    });
    service = TestBed.inject(SocketRecorderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
