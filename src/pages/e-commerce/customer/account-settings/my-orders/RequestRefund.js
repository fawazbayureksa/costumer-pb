import { useEffect, useState } from "react";
import ErrorDiv from "../../../../../components/helpers/ErrorDiv";
import axios from "axios";
import Config from "../../../../../components/axios/Config";
import Cookie from "js-cookie";
import SwalToast from "../../../../../components/helpers/SwalToast";
import Select from 'react-select'

/**
 * 
 * @param {string} orderCode  
 * @param {function} closeModal 
 * @param {function} refreshData refresh data in main page 
 * @param {function} t language
 * @returns 
 */
 const RequestRefund =(props)=>{   
    const [banks,set_banks]=useState([])
    const [bank, set_bank]=useState(null)
    const [account_name, set_account_name]=useState('')
    const [account_number, set_account_number]=useState('')
    const [notes, set_notes]=useState('')
    const [errors, set_errors]=useState({})
    const [submitting, set_submitting]=useState(false)

    useEffect(()=>{
        getBanks()
    },[])

    useEffect(()=>{
        if(!banks || banks.length === 0) return
        getLastRefundReceiver()
    },[banks])

    const getBanks=async()=>{
        axios.get(`${process.env.REACT_APP_BASE_API_URL}my-orders/getBanks`, Config({
            Authorization: `Bearer ${Cookie.get('token')}`
        })).then(response => {
            set_banks(response.data.data.map((item)=>(
                {value: item.id, label: item.name}
            )))            
        }).catch(error => {
            console.log(error);
        }).finally(() => {
        });
    }
    const getLastRefundReceiver=()=>{
        axios.get(`${process.env.REACT_APP_BASE_API_URL}my-orders/getLastRefundReceiver`, Config({
            Authorization: `Bearer ${Cookie.get('token')}`
        })).then(res => {
            set_bank(banks.find(x=>x.value === res.data.data.mp_bank_id))
            set_account_name(res.data.data.account_name)
            set_account_number(res.data.data.account_number)
        }).catch(error => {
            console.log(error);
        }).finally(() => {
            //
        });
    }

    const validate=()=>{
        let validate=true;
        let errors = {}

        if(!bank || !bank.value){
            validate=false;
            errors.bank = "Bank is required"
        }
        if(!account_name.trim()){
            validate=false;
            errors.account_name = "Account name is required"
        }
        if(!account_number.trim()){
            validate=false;
            errors.account_number = "Account number is required"
        }
        if(!notes.trim()){
            validate=false;
            errors.notes = "Notes is required"
        }

        set_errors(errors)
        return validate;
    }
    const submit=(e)=>{
        e.preventDefault();
        if(!validate()) return;

        let data = {
            notes: notes,
            order_code: props.orderCode,
            receiver:{
                bank_id:bank.value,
                account_name:account_name,
                account_number:account_number,
            }
        }

        set_submitting(true)
        let url = `${process.env.REACT_APP_BASE_API_URL}my-orders/requestRefund`
        axios.post(url, data, Config({
            Authorization: `Bearer ${Cookie.get('token')}`
        })).then(response => {
            props.closeModal()
            props.refreshData()
        }).catch(error => {
            console.log(error)
            if (error.response){
                console.log(error.response)
                if(error.response.data.message){
                    SwalToast.fire({title: error.response.data.message, icon: "error"})
                }
            }
        }).finally(()=>{
            set_submitting(false)
        });
    }

    return (
        <form onSubmit={submit}>  
             <div className="form-group">
                <label className="color-374650 " htmlFor="select_bank">Bank</label>
                <Select id="select_bank" value={bank} options={banks} onChange={(opt)=>set_bank(opt)} required/>
                <ErrorDiv error={errors.bank} />
            </div>
            <div className="form-group">
                <label htmlFor="input_account_name">Account name</label>
                <input type="text" className="form-control" value={account_name} onChange={(e)=>set_account_name(e.target.value)} required placeholder="Input account name" id="input_account_name" />
                <ErrorDiv error={errors.account_name} />
            </div>  
            <div className="form-group">
                <label htmlFor="input_account_number">Account number</label>
                <input type="text" className="form-control" value={account_number} onChange={(e)=>set_account_number(e.target.value)} required placeholder="Input account number" id="input_account_name" />
                <ErrorDiv error={errors.account_name} />
            </div>  
            <div className="form-group">
                <label htmlFor="input_notes">Notes</label>
                <textarea className="form-control" value={notes} onChange={(e)=>set_notes(e.target.value)} required rows={5} placeholder="Input notes" id="input_notes" />
                <ErrorDiv error={errors.notes} />
            </div>                    
            <div className="row mt-3">
                <div className="col-6">
                    <button type="button" onClick={props.closeModal} className="btn btn-block border-707070 color-374650 font-weight-bold">{props.t("general.cancel")}</button>
                </div>
                <div className="col-6">
                    <button type="submit" disabled={submitting} className="btn btn-block bgc-00896A text-white font-weight-bold">{props.t("general.send")}</button>
                </div>
            </div>
        </form>
    )
}

export default RequestRefund