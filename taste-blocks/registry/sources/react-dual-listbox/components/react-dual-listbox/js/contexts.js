import { createContext } from 'react';

const IconContext = createContext({});
const IdContext = createContext(() => {});
const LanguageContext = createContext({});

export {
    IconContext,
    IdContext,
    LanguageContext,
};
