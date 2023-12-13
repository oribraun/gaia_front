import { TestBed } from '@angular/core/testing';

import { WebSocketService } from './web-socket.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {Config} from "../../config";
import {ApiService} from "../api.service";

describe('WebSocketService', () => {
  let service: WebSocketService;

  beforeEach(() => {
    TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        providers: [Config, ApiService]
    });
    service = TestBed.inject(WebSocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
