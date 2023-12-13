import { SafeHtmlPipe } from './safe-html.pipe';
import {DomSanitizer} from "@angular/platform-browser";

describe('SafeHtmlPipe', () => {
    it('create an instance', () => {
        const sanitizerMock = {
            sanitize: jasmine.createSpy('sanitize'),
            bypassSecurityTrustHtml: jasmine.createSpy('bypassSecurityTrustHtml')
        } as unknown as DomSanitizer;
        const pipe = new SafeHtmlPipe(sanitizerMock);
        expect(pipe).toBeTruthy();
    });
});
