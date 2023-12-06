import { DynamicFontSizeDirective } from './dynamic-font-size.directive';
import {ElementRef, Injectable} from "@angular/core";
import {TestBed} from "@angular/core/testing";
@Injectable()
export class MockElementRef {
  nativeElement: {} | undefined;
}
let elRef: ElementRef;
beforeEach(() => {
    TestBed.configureTestingModule({
      // ...
      providers: [{provide: ElementRef, useValue: new MockElementRef()}]
    });

    // ...
    elRef = TestBed.get(ElementRef);
});
describe('DynamicFontSizeDirective', () => {
  it('should create an instance', () => {
    const directive = new DynamicFontSizeDirective(elRef);
    expect(directive).toBeTruthy();
  });
});
