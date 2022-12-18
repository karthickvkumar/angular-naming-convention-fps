import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OnlineHelpComponent } from './online-help.component';

describe('OnlineHelpComponent', () => {
  let component: OnlineHelpComponent;
  let fixture: ComponentFixture<OnlineHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OnlineHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OnlineHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
