import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnseenComponent } from './unseen.component';

describe('UnseenComponent', () => {
  let component: UnseenComponent;
  let fixture: ComponentFixture<UnseenComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UnseenComponent]
    });
    fixture = TestBed.createComponent(UnseenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
