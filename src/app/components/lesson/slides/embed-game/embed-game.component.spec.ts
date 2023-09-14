import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmbedGameComponent } from './embed-game.component';

describe('EmbedGameComponent', () => {
  let component: EmbedGameComponent;
  let fixture: ComponentFixture<EmbedGameComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmbedGameComponent]
    });
    fixture = TestBed.createComponent(EmbedGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
