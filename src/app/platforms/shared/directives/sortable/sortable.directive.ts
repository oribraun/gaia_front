import {Directive, ElementRef, EventEmitter, Input, OnInit, Output} from '@angular/core';
declare const $: any;

@Directive({
    selector: '[appSortable]'
})
export class SortableDirective implements OnInit {

    @Input() options: any = {};
    @Output() onSort: EventEmitter<any> = new EventEmitter<any>();

    constructor(
        private element: ElementRef
    ) { }

    ngOnInit(): void {
        if (this.element.nativeElement) {
            const events = {
                start: (event: any, ui: any) => {
                    ui.item.data('startIndex', ui.item.index());
                },
                stop: (event: any, ui: any) => {
                    const endIndex = ui.item.index();
                    const startIndex = ui.item.data('startIndex');
                    this.onSort.emit({startIndex, endIndex});
                }
            };
            const options = {...this.options, ...events};
            $(this.element.nativeElement).sortable(options);
            $(this.element.nativeElement).disableSelection();
        }
    }



}
