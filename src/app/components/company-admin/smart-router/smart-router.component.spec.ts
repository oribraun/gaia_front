import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmartRouterComponent } from './smart-router.component';

describe('SmartRouterComponent', () => {
  let component: SmartRouterComponent;
  let fixture: ComponentFixture<SmartRouterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SmartRouterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SmartRouterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
