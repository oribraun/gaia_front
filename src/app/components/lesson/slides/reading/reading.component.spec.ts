import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReadingComponent } from './reading.component';

describe('ReadingComponent', () => {
  let component: ReadingComponent;
  let fixture: ComponentFixture<ReadingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReadingComponent]
    });
    fixture = TestBed.createComponent(ReadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
