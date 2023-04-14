import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompareVendorsComponent } from './compare-vendors.component';

describe('CompareVendorsComponent', () => {
  let component: CompareVendorsComponent;
  let fixture: ComponentFixture<CompareVendorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompareVendorsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompareVendorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
