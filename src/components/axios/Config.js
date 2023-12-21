import { loadProgressBar } from "axios-progress-bar";
import Cookie from 'js-cookie';
import { handleLogout } from "../AuthFunction";
// import 'axios-progress-bar/dist/nprogress.css';
import './ProgressBar.css';

const Config = (headers, params = null) => {

    return {
        onUploadProgress: progressEvent => {
            loadProgressBar();
        },
        onDownloadProgress: progressEvent => {
            loadProgressBar();
        },
        headers: headers,
        params: params,
    }
};

export const ErrorHandler = (error) => {
    if (error.response) {
        if (error.response.status === 401) {
            handleLogout()
        }
    }
}
export default Config;