import { TestBed } from '@angular/core/testing';

import { GenService } from './gen.service';

describe('GenService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GenService = TestBed.get(GenService);
    expect(service).toBeTruthy();
  });
});
