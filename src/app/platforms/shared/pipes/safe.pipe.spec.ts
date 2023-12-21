import { SafePipe } from './safe.pipe';
import {DomSanitizer} from "@angular/platform-browser";

describe('SafePipe', () => {
    it('create an instance', () => {
        const sanitizerMock = {
            sanitize: jasmine.createSpy('sanitize'),
            bypassSecurityTrustHtml: jasmine.createSpy('bypassSecurityTrustHtml')
        } as unknown as DomSanitizer;
        const pipe = new SafePipe(sanitizerMock);
        expect(pipe).toBeTruthy();
    });
});
