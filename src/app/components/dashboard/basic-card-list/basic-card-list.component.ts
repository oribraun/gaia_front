import {
    Component,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    OnChanges,
    OnInit,
    Output, SimpleChanges,
    ViewChild
} from '@angular/core';

@Component({
    selector: 'app-basic-card-list',
    templateUrl: './basic-card-list.component.html',
    styleUrls: ['./basic-card-list.component.less']
})
export class BasicCardListComponent implements OnInit, OnChanges {

    @Input('class') class: string = '';
    @Input('header') header: string = '';
    @Input('totalItems') totalItems: number = 0;
    @Input('items') items: any = [];
    @Input('keysToShow') keysToShow: any = [];
    @Input('cols') cols: any = [];
    @Input('showPagination') showPagination: boolean = true;
    @Output() onPagination: EventEmitter<any> = new EventEmitter<any>();
    @Output() onSelectItem: EventEmitter<any> = new EventEmitter<any>();
    @Input('paginationErrMessage') paginationErrMessage: any;
    @Input('paginationLastState') paginationLastState: any;
    paginationError = '';
    selectedItem: any;

    public gettingItems = false;
    public input = '';
    public pagination: any = {
        current: 1,
        start: 1,
        end: 10,
        pages: 0,
        maxPages: 10,
        offset: 0,
        limit: 10
    };

    constructor(
        private element: ElementRef,
    ) { }

    ngOnInit(): void {
        // this.totalItems = 1000;
        this.checkWidth();
        this.checkMinItems();
        this.setPages();
    }

    checkMinItems() {
        console.log('this.items', this.items)
        for (let i = this.items.length; i < this.pagination.limit; i++) {
            this.items.push({})
        }
    }

    resetError() {
        this.paginationError = ''
    }

    resetPagination() {
        this.pagination = {
            current: 1,
            start: 1,
            end: 10,
            pages: 0,
            maxPages: 10,
            offset: 0,
            limit: 10
        };
    }

    setPages() {
        this.pagination.pages = Math.ceil(this.totalItems / this.pagination.limit);
        this.pagination.start = this.pagination.current - Math.floor(this.pagination.maxPages / 2) + 1;
        this.pagination.end = this.pagination.current + Math.ceil(this.pagination.maxPages / 2);
        if (this.pagination.start < 1) {
            this.pagination.start = 1;
            // this.pagination.current = this.pagination.start;
            this.pagination.end = this.pagination.maxPages;
        }
        if (this.pagination.end > this.pagination.pages) {
            this.pagination.end = this.pagination.pages;
            // this.pagination.current = this.pagination.end;
            this.pagination.start = this.pagination.end - this.pagination.maxPages + 1;
            if (this.pagination.start < 1) {
                this.pagination.start = 1;
            }
        }
        if (this.pagination.current < 1) {
            this.pagination.current = this.pagination.start;
        }
        if (this.pagination.current > this.pagination.end) {
            this.pagination.current = this.pagination.end;
        }
        console.log('this.pagination', this.pagination)
    }

    nextPage() {
        if (this.gettingItems) { return; }
        this.resetError();
        this.paginationLastState = {...this.pagination};
        if (this.pagination.current < this.pagination.pages) {
            this.pagination.current++;
            this.getItems();
        }
        if (this.pagination.end < this.pagination.pages && this.pagination.current > Math.floor(this.pagination.maxPages / 2)) {
            this.pagination.start++;
            this.pagination.end++;
        }
        this.pagination.offset = (this.pagination.current - 1);
    }

    prevPage() {
        if (this.gettingItems) { return; }
        this.resetError();
        this.paginationLastState = {...this.pagination};
        if (this.pagination.current > 1) {
            this.pagination.current--;
            this.getItems();
        }
        if (this.pagination.start > 1 && this.pagination.current < this.pagination.pages - Math.ceil(this.pagination.maxPages / 2)) {
            this.pagination.start--;
            this.pagination.end--;
        }
        this.pagination.offset = (this.pagination.current - 1);
    }

    setPage(page: string) {
        if (this.gettingItems) { return; }
        if (page == this.pagination.current || !page) {
            return;
        }
        this.resetError();
        this.paginationLastState = {...this.pagination};
        this.pagination.current = parseInt(page, 0);
        if (this.pagination.current < 1) {
            this.pagination.current = this.pagination.start;
        }
        if (this.pagination.current > this.pagination.pages) {
            this.pagination.current = this.pagination.pages;
        }
        this.pagination.offset = (parseInt(this.pagination.current, 0) - 1);

        this.setPages();
        this.getItems();
    }

    getItems() {
        this.gettingItems = true;
        this.onPagination.emit(this.pagination);
        // this.gettingBlocks = true;
        // const url = window.location.origin + '/explorer-api/db/' + this.data.wallet + '/getAllBlocks';
        // console.log('url', url);
        // const data = {
        //     limit: this.pagination.limit,
        //     offset: this.pagination.offset
        // };
        // this.http.post(url, data).subscribe(
        //     (response: any) => {
        //         if (!response.err) {
        //             this.blocks = response.data;
        //             this.currentTable = this.emptyTable.slice();
        //             for (let i = 0; i < this.blocks.length; i++) {
        //                 this.currentTable[i] = this.blocks[i];
        //             }
        //         }
        //         if (!this.showPagination) {
        //             this.showPagination = true;
        //         }
        //         this.gettingBlocks = false;
        //     },
        //     (error) => {
        //         console.log(error);
        //         this.gettingBlocks = false;
        //     }
        // );
    }

    selectItem(item: any) {
        if (this.onSelectItem.observers.length) {
            this.selectedItem = item;
            this.onSelectItem.emit({selectedItem: this.selectedItem, offset: 0, limit: this.pagination.limit});
        }
    }

    @HostListener('window:resize')
    onWindowResize() {
        // debounce resize, wait for resize to finish before doing stuff
        this.checkWidth();
        this.setPages();
    }

    checkWidth() {
        if (this.element.nativeElement.offsetWidth <= 300) {
            this.pagination.maxPages = 3;
        }
        else if (this.element.nativeElement.offsetWidth <= 500) {
            this.pagination.maxPages = 5;
        } else {
            this.pagination.maxPages = 10;
        }
    }
    preventDefault(e: Event) {
        e.preventDefault();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['items'] && !changes['items'].firstChange) {
            this.gettingItems = false;
            this.checkMinItems();
        }
        if (changes['totalItems'] && !changes['totalItems'].firstChange) {
            this.resetPagination();
            this.setPages();
        }
        if (changes['paginationErrMessage'] && !changes['paginationErrMessage'].firstChange) {
            this.gettingItems = false;
            if (!this.paginationErrMessage) {
                this.checkMinItems();
            } else {
                this.pagination = {...this.paginationLastState};
                this.paginationLastState = null;
                this.paginationError = this.paginationErrMessage;
                console.log('this.paginationError', this.paginationError)
            }
        }
    }


}
