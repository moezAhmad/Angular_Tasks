import { TestBed } from '@angular/core/testing';

import { HTTPRequestsService } from './http-requests.service';

describe('HTTPRequestsService', () => {
  let service: HTTPRequestsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HTTPRequestsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
