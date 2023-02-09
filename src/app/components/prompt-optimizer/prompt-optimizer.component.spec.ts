import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromptOptimizerComponent } from './prompt-optimizer.component';

describe('PromptOptimizerComponent', () => {
  let component: PromptOptimizerComponent;
  let fixture: ComponentFixture<PromptOptimizerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PromptOptimizerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PromptOptimizerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
