import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GaiaDataRoomComponent } from './gaia-data-room.component';

describe('GaiaDataRoomComponent', () => {
  let component: GaiaDataRoomComponent;
  let fixture: ComponentFixture<GaiaDataRoomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GaiaDataRoomComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GaiaDataRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
