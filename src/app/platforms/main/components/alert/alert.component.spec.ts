import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertComponent } from './alert.component';
import {AlertService} from "../../services/alert.service";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";

describe('AlertComponent', () => {
    let component: AlertComponent;
    let fixture: ComponentFixture<AlertComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [AlertComponent],
            providers: [AlertService],
            imports: [NoopAnimationsModule]
        });
        fixture = TestBed.createComponent(AlertComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
