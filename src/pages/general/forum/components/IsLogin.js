import React from "react"
import Cookies from "js-cookie"
import SwalToast from "../../../../components/helpers/SwalToast"

export const isLogin = () => {
    if (Cookies.get('user')) {
        return true
    } else {
        return false
    }
}

export const isLoginTrue = (id) => {
    if (!isLogin()) return
    if (JSON.parse(Cookies.get('user')).id == id) return true
    else return false
}