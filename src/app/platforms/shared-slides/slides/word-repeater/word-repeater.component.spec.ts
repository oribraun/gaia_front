import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WordRepeaterComponent } from './word-repeater.component';

describe('WordRepeaterComponent', () => {
  let component: WordRepeaterComponent;
  let fixture: ComponentFixture<WordRepeaterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WordRepeaterComponent]
    });
    fixture = TestBed.createComponent(WordRepeaterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
