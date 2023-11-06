import { TestBed } from '@angular/core/testing';

import { SocketRecorderService } from './socket-recorder.service';

describe('SocketSpeechRecognitionService', () => {
  let service: SocketRecorderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SocketRecorderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
