import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import {Config} from "./config";
import {WebSocketService} from "./services/web-sockets/web-socket.service";
import {HelperService} from "./services/helper.service";
import {ActivatedRoute, convertToParamMap, Router} from "@angular/router";
import {of} from "rxjs";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {HeaderComponent} from "./components/header/header.component";
import {AlertComponent} from "./components/alert/alert.component";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";
import {FormsModule} from "@angular/forms";

describe('AppComponent', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                RouterTestingModule,
                HttpClientTestingModule,
                NoopAnimationsModule,
                FormsModule
            ],
            declarations: [
                AppComponent,
                HeaderComponent,
                AlertComponent
            ],
            providers: [
                Config,
                WebSocketService,
                HelperService,
                Router,
                {
                    provide: ActivatedRoute,
                    useValue: {
                        queryParams: of(convertToParamMap({ redirectUser: 'true' })) // Provide any route parameter values you need for testing
                    }
                }
            ]
        }).compileComponents();
    });

    it('should create the app', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.componentInstance;
        expect(app).toBeTruthy();
    });

    it(`should have as title 'frontend'`, () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.componentInstance;
        expect(app.title).toEqual('frontend');
    });

    // it('should render title', () => {
    //     const fixture = TestBed.createComponent(AppComponent);
    //     fixture.detectChanges();
    //     const compiled = fixture.nativeElement as HTMLElement;
    //     expect(compiled.querySelector('.content span')?.textContent).toContain('frontend');
    // });
});
