import React,{ useEffect } from 'react'
import firebase from '../../init-fcm';
import {
    getMessaging,
    getToken,
    onMessage
} from "firebase/messaging";
import Cookie from 'js-cookie'
import axios from 'axios'
import Config from '../axios/Config';
import SwalToast from './SwalToast';

/**
 * Function to request firebase cloud messaging token
 */
export const requestFCMToken=async()=> {
    if(!Cookie.get('token')) return;
    if (firebase) {
        console.log(Notification.permission)
        const messaging = getMessaging(firebase);
        if (!("Notification" in window)) {
            console.error("This browser does not support desktop notification");
        }
        else if (Notification.permission === "granted") {
            getTokenPermission()
        }
        else{
            Notification.requestPermission().then((permission) => {
                console.log(permission)
                if (permission === "granted"){
                    getTokenPermission()
                }else{
                    invalidateFCMToken();
                }
            })
           
        }
    }
}
export const getTokenPermission = async() =>{
    if(Cookie.get('fcm_token')) return;
    const messaging = getMessaging(firebase);
            const token = await getToken(messaging, {
                vapidKey: process.env.REACT_APP_FIREBASE_VAPIDKEY
            });
            axios.post(`${process.env.REACT_APP_BASE_API_URL}notification/requestFCMToken`, {
                token: token,
                device: "web"
            }, Config({
                Authorization: 'Bearer ' + Cookie.get('token')
            })).then(response => {
                Cookie.set('fcm_token', token);
            }).catch(error => {
                console.log(error);
            });
}
export const invalidateFCMToken=async()=>{
    
    if (!Cookie.get('fcm_token')) return;
    await axios.post(`${process.env.REACT_APP_BASE_API_URL}notification/setInactiveFCMToken`, {
        token: Cookie.get('fcm_token'),
        device: "web"
    }, Config({
        Authorization: 'Bearer ' + Cookie.get('token')
    })).then(response => {
        console.log('success invalidate fcm token')
    }).catch(error => {
        console.log(error);
    }).finally(()=>{
        Cookie.remove('fcm_token')
    })
}

  

/**
 * Component for receiving firebase notification
 * @param {string} type: notification type 
 * @param {function} onReceived: function on receiving message
 */

 export const FirebaseNotification =({type, onReceived})=>{
    const messaging = getMessaging(firebase);
    useEffect(()=>{
        if(!type) return;
        if(!onReceived) return;
        if(!messaging) return;

        if("serviceWorker" in navigator){
            navigator.serviceWorker.addEventListener("message", theFunction)
        }
        return()=>{
            if("serviceWorker" in navigator){
                navigator.serviceWorker.removeEventListener("message", theFunction)
            }
        }
    },[type, onReceived])

    const theFunction=(payload)=>{
        console.log(payload)
        let data = payload.data.data;
        onReceived(data);
    }

    return null;
 }
