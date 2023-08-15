import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhiteBoardComponent } from './white-board.component';

describe('WhiteBoardComponent', () => {
  let component: WhiteBoardComponent;
  let fixture: ComponentFixture<WhiteBoardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WhiteBoardComponent]
    });
    fixture = TestBed.createComponent(WhiteBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
