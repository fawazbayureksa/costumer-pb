import { useEffect } from "react"
import Cookie from 'js-cookie'
import axios from 'axios';
import Config from "./axios/Config";

const MidtransSnap=()=>{
    useEffect(()=>{
        let scriptTag;
        let asyncFunction = async()=>{
            let clientKey = await getMidtransClientKey();

            scriptTag = document.createElement('script');
            scriptTag.src = process.env.REACT_APP_MIDTRANS_SNAP_URL;
            scriptTag.setAttribute('data-client-key', clientKey);
           
            document.body.appendChild(scriptTag);
        }
        asyncFunction();
        
        
        return ()=>{
            if(scriptTag) document.body.removeChild(scriptTag)
        }
    },[])

    const getMidtransClientKey=async()=>{
        await axios.get(`${process.env.REACT_APP_BASE_API_URL}midtrans/getMidtransClientKey`, Config({
            Authorization: `Bearer ${Cookie.get('token')}`
        })).then(response => {
            return response.data.data
        }).catch(error => {
            console.log(error);
            if(error.response){
                console.log(error.response)
            }
        }).finally(() => {
            //
        });
    }

    return <></>
}

export default MidtransSnap;