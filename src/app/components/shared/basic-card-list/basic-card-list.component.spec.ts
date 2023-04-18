import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicCardListComponent } from './basic-card-list.component';

describe('BasicCardListComponent', () => {
  let component: BasicCardListComponent;
  let fixture: ComponentFixture<BasicCardListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BasicCardListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BasicCardListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
