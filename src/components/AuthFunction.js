
import axios from 'axios';
import Cookie from 'js-cookie';
import Config from './axios/Config';
import IsEmpty from "./helpers/IsEmpty";
import SwalToast from './helpers/SwalToast';
import { invalidateFCMToken } from './helpers/FirebaseEvent';

export const handleLogout = async (history) => {
    if (!IsEmpty(Cookie.get('token'))) {
        await invalidateFCMToken();
        Cookie.remove('token');
        Cookie.remove('user');
        localStorage.removeItem("expire_date")

        window.location.reload();
        // history.go(0)
    }
}

const login = async (url, data, social) => {

    const getUrlParams = () => {
        let params = new URLSearchParams(window.location.search);
        return {
            from: params.get('from') || null
        };
    }

    await axios.post(url, data, Config()).then(res => {
        if (res.data.data.access_token) {
            Cookie.set('token', res.data.data.access_token);
            Cookie.set('user', res.data.data.user);

            let now = new Date()
            now.setDate(now.getDate() + parseInt(process.env.REACT_APP_TOKEN_EXPIRE_DAYS))
            localStorage.setItem("expire_date", now)

            if (social === "degadai"){
                window.opener.location.reload();
                window.close()
            }else{
                let urlParams = getUrlParams()
                if (urlParams.from) {
                    window.location.href = `${window.location.origin}${urlParams.from}`
                } else {
                    window.location.reload();
                }
            }

            SwalToast.fire({
                icon: 'success',
                title: 'Successfully sign in'
            });

        } else {
            throw new Error("Whoops. Something went wrong!")
        }
    }).catch((error) => {
        console.log(error)
        if (error.response) {
            if (error.response.status === 401) {
                throw new Error("Kredensial salah!")
            } else if (error.response.status === 403) {
                throw 403
            } else if (error.response.status == 429) {
                throw new Error("Terlalu banyak mencoba. Silahkan coba lagi dalam satu menit")
            }
            else {
                throw new Error(error.response.data.message)
            }
        } else {
            throw new Error("Whoops. Something went wrong!")
        }
    })
}

export const handleLogin = async (email, password) => {
    const data = {
        email: email,
        password: password,
    };

    let url = `${process.env.REACT_APP_BASE_API_URL}auth/login`

    await login(url, data, "")
}

export const handleSocialLogin = async (idToken, social) => {
    const data = {
        id_token: idToken,
    };

    let url = ""
    switch (social) {
        case "facebook":
            url = `${process.env.REACT_APP_BASE_API_URL}facebook-login`
            break;
        case "google":
            url = `${process.env.REACT_APP_BASE_API_URL}google-login`
            break;
        case "degadai":
            url = `${process.env.REACT_APP_BASE_API_URL}auth/sso-validate`
            break;
        default:
            break;
    }

    await login(url, data, social)
}