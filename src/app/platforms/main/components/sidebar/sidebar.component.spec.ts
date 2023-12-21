import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarComponent } from './sidebar.component';
import {Config} from "../../config";
import {ApiService} from "../../services/api.service";
import {Router, RouterModule} from "@angular/router";
import {HelperService} from "../../services/helper.service";
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('SidebarComponent', () => {
    let component: SidebarComponent;
    let fixture: ComponentFixture<SidebarComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterModule.forRoot([])],
            declarations: [ SidebarComponent ],
            providers: [Config, ApiService, Router, HelperService]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SidebarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
