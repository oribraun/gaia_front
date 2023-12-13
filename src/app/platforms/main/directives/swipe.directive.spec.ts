import { SwipeDirective } from './swipe.directive';
import {ElementRef, Injectable} from "@angular/core";
import {TestBed} from "@angular/core/testing";
@Injectable()
export class MockElementRef {
    nativeElement: {} | undefined;
}
let elRef: ElementRef;
describe('SwipeDirective', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            // ...
            providers: [{provide: ElementRef, useValue: new MockElementRef()}]
        });

        // ...
        elRef = TestBed.get(ElementRef);
    });
    it('should create an instance', () => {
        const directive = new SwipeDirective(elRef);
        expect(directive).toBeTruthy();
    });
});
