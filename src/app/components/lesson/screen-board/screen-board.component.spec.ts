import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreenBoardComponent } from './screen-board.component';

describe('ScreenBoardComponent', () => {
  let component: ScreenBoardComponent;
  let fixture: ComponentFixture<ScreenBoardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ScreenBoardComponent]
    });
    fixture = TestBed.createComponent(ScreenBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
