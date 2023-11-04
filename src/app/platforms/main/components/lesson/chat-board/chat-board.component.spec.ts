import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatBoardComponent } from './chat-board.component';

describe('ChatBoardComponent', () => {
  let component: ChatBoardComponent;
  let fixture: ComponentFixture<ChatBoardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChatBoardComponent]
    });
    fixture = TestBed.createComponent(ChatBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
