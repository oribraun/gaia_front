import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WordTranslatorComponent } from './word-translator.component';

describe('WordTranslatorComponent', () => {
  let component: WordTranslatorComponent;
  let fixture: ComponentFixture<WordTranslatorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WordTranslatorComponent]
    });
    fixture = TestBed.createComponent(WordTranslatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
