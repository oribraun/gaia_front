import { Injectable } from '@angular/core';
import {User} from "../../shared/entities/user";
import * as uuid from 'uuid';

declare let $: any;
@Injectable({
    providedIn: 'root'
})
export class HelperService {

    tooltipTimeout: any = null;

    applyTooltip() {
        $(() => {
            const e = $('[data-bs-toggle="tooltip"]');
            if (e && e.length) {
                e.tooltip({
                    trigger: 'hover'
                });
                e.on('click', () => {
                    clearInterval(this.tooltipTimeout);
                    this.tooltipTimeout = setTimeout(() => {
                        e.tooltip('hide');
                    }, 1000);
                });
            }
        });
    }

    create_uuidv5(str: string = '', hash: string = '') {
        // @ts-ignore
        let MY_NAMESPACE = '1b671a64-40d5-491e-99b0-da01ff1f3341';
        if (hash) {
            MY_NAMESPACE = hash;
        }
        const u = uuid.v5(str, MY_NAMESPACE);
        return u;
    }

    create_user_socket_uuidv5(str: string = '', hash: string = '') {
        // @ts-ignore
        let MY_NAMESPACE = '1b671a64-40d5-491e-99b0-da01ff1f3342';
        if (hash) {
            MY_NAMESPACE = hash;
        }
        const u = uuid.v5(str, MY_NAMESPACE);
        return u;
    }

    getUserReturnUrl(user: User, user_on_boarding_finished: boolean) {
        let returnUrl = '';
        if (user.id && user.last_logged_platform && user_on_boarding_finished) {
            returnUrl = '/' + user.last_logged_platform + '/dashboard';
        } else {
            returnUrl = '/onBoarding';
        }
        return returnUrl;
    }

    translateGoogle(message: string, sourceLang = 'en', targetLang = 'he'): Promise<string> {
        return new Promise((resolve, reject) => {

            const url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=" + sourceLang + "&tl=" + targetLang + "&dt=t&q=" + encodeURI(message);

            $.getJSON(url, (data: any) => {
                let translated_text = '';
                try {
                    translated_text = data[0].map((o: any) => o[0]).join('');
                    resolve(translated_text);
                } catch (e) {
                    reject(e);
                }
            });
        });
    }

    /**
     * Get the pointer position
     * param {any} e (event)
     * param {any} preventTouch
     * return {Object} { x: , y: }
     */
    getPointerPos(e: any, preventTouch: boolean) {
        let x = 0;
        let y = 0;
        if (e.clientX !== undefined && e.clientY !== undefined) {
            x = e.clientX;
            y = e.clientY;
        } else if (e.taretTouches) {
            if (preventTouch) {
                e.preventDefault();
            }
            x = e.taretTouches[0].clientX;
            y = e.taretTouches[0].clientY;
        } else if (e.touches) {
            if (preventTouch) {
                e.preventDefault();
            }
            x = e.touches[0].clientX;
            y = e.touches[0].clientY;
        }
        return {
            x: x,
            y: y
        };
    }

    joinAsrAndRemoveDuplicates(inputArray: string[]) {
        // Split each string into an array of words
        console.log('inputArray', inputArray);
        const outputArray = [];
        for (let i = 0; i < inputArray.length; i++) {
            const a_prev = inputArray[i - 1];
            const a = inputArray[i];
            if (a_prev) {
                const a_split: any[] = a.split(' ');
                if (a_split.length) {
                    let lastIndexFound: any = null;
                    const indexsToRemove: any[] = [];
                    const a_prev_split: any[] = a_prev.split(' ');
                    for (const item of a_split) {
                        const index_in_prev_a = a_prev_split.indexOf(item);
                        if (index_in_prev_a > -1) {
                            const index_in_a = a_split.indexOf(item);
                            if (lastIndexFound === null) {
                                lastIndexFound = index_in_prev_a;
                                indexsToRemove.push(index_in_a);
                            } else {
                                if (index_in_prev_a === lastIndexFound + 1) {
                                    lastIndexFound = index_in_prev_a;
                                    indexsToRemove.push(index_in_a);
                                }
                            }
                        } else {
                            if (lastIndexFound === null) {
                                outputArray.push(a);
                                break;
                            }
                        }
                    }
                    if (indexsToRemove.length) {
                        const resultArray = a_split.filter((_, index) => !indexsToRemove.includes(index));
                        outputArray.push(resultArray.join(' '));
                    }
                } else {
                    outputArray.push(a);
                }
            } else {
                outputArray.push(a);
            }
        }
        console.log('outputArray', outputArray);
        return outputArray.join(' ');
    }

    saveLangInLocalStorage(lang: string) {
        localStorage.setItem('lang', lang);
    }

    getLangFromLocalStorage() {
        return localStorage.getItem('lang');
    }


}
