import { SortableDirective } from './sortable.directive';
import {TestBed} from "@angular/core/testing";
import {ElementRef} from "@angular/core";
import {MockElementRef} from "../dynamic-font-size/dynamic-font-size.directive.spec";

let elRef: ElementRef;
describe('SortableDirective', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            // ...
            providers: [{provide: ElementRef, useValue: new MockElementRef()}]
        });

        // ...
        elRef = TestBed.get(ElementRef);
    });
    it('should create an instance', () => {
        const directive = new SortableDirective(elRef);
        expect(directive).toBeTruthy();
    });
});
