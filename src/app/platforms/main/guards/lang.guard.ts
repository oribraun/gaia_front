import {CanActivateFn, Router} from '@angular/router';
import {inject} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";

const availableLangs = ['en', 'he'];

export const langGuard: CanActivateFn = (route, state) => {
    const router: Router = inject(Router);
    const translate: TranslateService = inject(TranslateService);
    const lang = route.paramMap.get('lang');
    if (lang && availableLangs.indexOf(lang) > -1) {
        return true;
    } else {
        const defaultLang = translate.getDefaultLang(); // Change this to your default lang value
        const currentUrl = state.url;
        let defaultLangUrl;
        if (currentUrl.indexOf(`/${lang}/`) > -1) {
            defaultLangUrl = currentUrl.replace(`/${lang}/`, `/${defaultLang}/`);
        } else {
            defaultLangUrl = currentUrl.replace(`/${lang}`, `/${defaultLang}`);
        }
        // Redirect to a default route or show an error page
        router.navigateByUrl(defaultLangUrl);
        return false;
    }
};
