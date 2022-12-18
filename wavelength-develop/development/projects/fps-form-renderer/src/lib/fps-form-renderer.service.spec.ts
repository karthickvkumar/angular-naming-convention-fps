import { TestBed } from '@angular/core/testing';

import { FpsFormRendererService } from './fps-form-renderer.service';

describe('FpsFormRendererService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FpsFormRendererService = TestBed.get(FpsFormRendererService);
    expect(service).toBeTruthy();
  });
});
