import { TestBed } from '@angular/core/testing';

import { SocketSpeechRecognitionService } from './socket-speech-recognition.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {Config} from "../../config";
import {ApiService} from "../api.service";

describe('SocketSpeechRecognitionService', () => {
  let service: SocketSpeechRecognitionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [Config, ApiService]
    });
    service = TestBed.inject(SocketSpeechRecognitionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
