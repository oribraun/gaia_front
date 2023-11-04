import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelBoardComponent } from './panel-board.component';

describe('PanelBoardComponent', () => {
  let component: PanelBoardComponent;
  let fixture: ComponentFixture<PanelBoardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PanelBoardComponent]
    });
    fixture = TestBed.createComponent(PanelBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
