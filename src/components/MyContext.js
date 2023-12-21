import { createContext } from "react";

const MyContext = createContext({
    theme_settings: null,
    companyName: '',
    separateWebApp: null,
    changeMetaTitleAndDesc: () => { },

    ticket_is_being_process: 0,
    sticky_top_px: 0,
});

export default MyContext;
