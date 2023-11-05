import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeakingComponent } from './speaking.component';

describe('SpeakingComponent', () => {
  let component: SpeakingComponent;
  let fixture: ComponentFixture<SpeakingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SpeakingComponent]
    });
    fixture = TestBed.createComponent(SpeakingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
