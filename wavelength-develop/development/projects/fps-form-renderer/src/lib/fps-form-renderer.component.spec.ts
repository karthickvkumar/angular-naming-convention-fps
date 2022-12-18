import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FpsFormRendererComponent } from './fps-form-renderer.component';

describe('FpsFormRendererComponent', () => {
  let component: FpsFormRendererComponent;
  let fixture: ComponentFixture<FpsFormRendererComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FpsFormRendererComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FpsFormRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
