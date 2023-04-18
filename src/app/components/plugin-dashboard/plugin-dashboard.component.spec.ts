import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PluginDashboardComponent } from './company-dashboard.component';

describe('CompanyDashboardComponent', () => {
  let component: PluginDashboardComponent;
  let fixture: ComponentFixture<PluginDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PluginDashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PluginDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
