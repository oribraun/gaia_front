import { TestBed } from '@angular/core/testing';

import { SocketSpeechRecognitionService } from './socket-speech-recognition.service';

describe('SocketSpeechRecognitionService', () => {
  let service: SocketSpeechRecognitionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SocketSpeechRecognitionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
