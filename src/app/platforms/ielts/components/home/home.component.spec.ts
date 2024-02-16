import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeComponent } from './home.component';
import {TranslateModule} from "@ngx-translate/core";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {AudioPlayerComponent} from "../../../shared/components/audio-player/audio-player.component";
import {FormsModule} from "@angular/forms";
import {Config} from "../../../main/config";
import {ApiService} from "../../../main/services/api.service";
import {HelperService} from "../../../main/services/helper.service";

describe('HomeComponent', () => {
    let component: HomeComponent;
    let fixture: ComponentFixture<HomeComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                FormsModule,
                HttpClientTestingModule,
                TranslateModule.forRoot()
            ],
            declarations: [HomeComponent, AudioPlayerComponent],
            providers: [Config, ApiService, HelperService]
        })
            .compileComponents();

        fixture = TestBed.createComponent(HomeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
