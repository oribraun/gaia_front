import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EndingComponent } from './ending.component';

describe('EndingComponent', () => {
  let component: EndingComponent;
  let fixture: ComponentFixture<EndingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EndingComponent]
    });
    fixture = TestBed.createComponent(EndingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
