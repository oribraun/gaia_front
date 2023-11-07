import { Injectable } from '@angular/core';
import {User} from "../entities/user";
const { v4: uuidv4, v5: uuidv5 } = require('uuid');

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

    create_uuidv5(str: string = '', hash: string = '') {
        // @ts-ignore
        let MY_NAMESPACE = '1b671a64-40d5-491e-99b0-da01ff1f3341';
        if (hash) {
            MY_NAMESPACE = hash
        }
        const u = uuidv5(str, MY_NAMESPACE);
        return u;
    };

    create_user_socket_uuidv5(str: string = '', hash: string = '') {
        // @ts-ignore
        let MY_NAMESPACE = '1b671a64-40d5-491e-99b0-da01ff1f3342';
        if (hash) {
            MY_NAMESPACE = hash
        }
        const u = uuidv5(str, MY_NAMESPACE);
        return u;
    };

    getUserReturnUrl(user: User) {
        let returnUrl = '';
        if (user.id && user.last_logged_platform) {
            returnUrl = '/' + user.last_logged_platform + '/dashboard'
        } else {
            returnUrl = '/onBoarding'
        }
        return returnUrl;
    }

    translateGoogle(message: string): Promise<string> {
        return new Promise((resolve, reject) => {
            var sourceLang = 'en';
            var targetLang = 'he';

            var url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl="+ sourceLang + "&tl=" + targetLang + "&dt=t&q=" + encodeURI(message);

            $.getJSON(url, (data: any) => {
                let translated_text = '';
                try {
                    translated_text = data[0].map((o: any) => o[0]).join('')
                    resolve(translated_text);
                } catch (e) {
                    reject(e)
                }
            });
        })
    }
}
