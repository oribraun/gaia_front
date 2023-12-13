import { SafePipe } from './safe.pipe';
import {
    DomSanitizer,
    SafeHtml,
    SafeStyle,
    SafeScript,
    SafeUrl,
    SafeResourceUrl,
    SafeValue
} from '@angular/platform-browser';
import {ElementRef, Injectable, SecurityContext} from "@angular/core";
import {TestBed} from "@angular/core/testing";
@Injectable()
export class MockDomSanitizer implements DomSanitizer {
    sanitize(context: SecurityContext, value: SafeValue | string | null): string | null {
        return value as string;
    }

    bypassSecurityTrustHtml(value: string): SafeHtml {
        return value as SafeHtml;
    }

    bypassSecurityTrustStyle(value: string): SafeStyle {
        return value as SafeStyle;
    }

    bypassSecurityTrustScript(value: string): SafeScript {
        return value as SafeScript;
    }

    bypassSecurityTrustUrl(value: string): SafeUrl {
        return value as SafeUrl;
    }

    bypassSecurityTrustResourceUrl(value: string): SafeResourceUrl {
        return value as SafeResourceUrl;
    }
}
let sanitizer: DomSanitizer;
describe('SafePipe', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            // declarations: [YourComponent],
            providers: [{ provide: DomSanitizer, useClass: MockDomSanitizer }]
        });

        sanitizer = TestBed.inject(DomSanitizer);
    });
    it('create an instance', () => {
        const pipe = new SafePipe(sanitizer);
        expect(pipe).toBeTruthy();
    });
});
