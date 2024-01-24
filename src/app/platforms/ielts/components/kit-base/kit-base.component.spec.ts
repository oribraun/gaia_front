import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KitBaseComponent } from './kit-base.component';

describe('KitBaseComponent', () => {
  let component: KitBaseComponent;
  let fixture: ComponentFixture<KitBaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KitBaseComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(KitBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
