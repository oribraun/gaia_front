import { Injectable } from '@angular/core';

declare var $: any;
@Injectable({
    providedIn: 'root'
})
export class HelperService {

    tooltipTimeout: any = null;
    constructor() { }

    applyTooltip() {
        $(() => {
            const e = $('[data-bs-toggle="tooltip"]');
            if (e && e.length) {
                e.tooltip({
                    trigger: 'hover'
                })
                e.on('click', () => {
                    clearInterval(this.tooltipTimeout)
                    this.tooltipTimeout = setTimeout(() => {
                        e.tooltip('hide')
                    }, 1000)
                })
            }
        })
    }
}
