import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
    selector: 'app-basic-card-list',
    templateUrl: './basic-card-list.component.html',
    styleUrls: ['./basic-card-list.component.less']
})
export class BasicCardListComponent implements OnInit {

    @Input('class') class: string = '';
    @Input('header') header: string = '';
    @Input('totalItems') totalItems: number = 0;
    @Input('items') items: any = [];
    @Input('keysToShow') keysToShow: any = [];
    @Input('cols') cols: any = [];
    @Input('showPagination') showPagination: boolean = true;
    @Output() onPagination: EventEmitter<any> = new EventEmitter<any>();

    offset = 0;
    limit = 10;

    constructor() { }

    ngOnInit(): void {
    }

    pagination(page: number) {
        if (this.totalItems > 0) {
            this.offset = page;
            this.onPagination.emit({
                offset: page,
                limit: this.limit
            })
        }
    }
    onNext() {
        if (this.totalItems > 0) {
            if (this.offset < (Math.floor(this.totalItems / this.limit) - 1)) {
                this.offset++;
                this.onPagination.emit({
                    offset: this.offset,
                    limit: this.limit
                })
            }
        }
    }
    onPrev() {
        if (this.totalItems > 0) {
            if (this.offset > 0) {
                this.offset--;
                this.onPagination.emit({
                    offset: this.offset,
                    limit: this.limit
                })
            }
        }
    }

    preventDefault(e: Event) {
        e.preventDefault();
    }

}
