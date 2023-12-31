import i18n from 'i18next';
import Backend from 'i18next-xhr-backend';
import { initReactI18next } from 'react-i18next';
import Cookie from 'js-cookie';

i18n
    .use(Backend)
    .use(initReactI18next)
    .init({
        lng: Cookie.get('language_code') ? Cookie.get('language_code') : 'en',
        backend: {
            /* translation file path */
            loadPath: '/assets/i18n/{{ns}}/{{lng}}.json'
        },
        fallbackLng: 'en',
        debug: true,
        /* can have multiple namespace, in case you want to divide a huge translation into smaller pieces and load them on demand */
        ns: ['translations'],
        defaultNS: 'translations',
        keySeparator: false,
        interpolation: {
            escapeValue: false,
            formatSeparator: ','
        },
        react: {
            useSuspense: true,
        }
    }, (error, t) => {
        console.log('ea', error)
        console.log('t', t)
    })

export default i18n;