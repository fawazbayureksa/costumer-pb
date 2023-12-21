import { useEffect, useState } from "react";
import ErrorDiv from "../../../../../components/helpers/ErrorDiv";
import Select from 'react-select'
import axios from "axios";
import Config from "../../../../../components/axios/Config";
import Cookie from "js-cookie";
import ExceedUploadLimit from "../../../../../components/helpers/ExceedUploadLimit";
import LoadingProgress from "../../../../../components/helpers/LoadingProgress";

/**
 * @param {string} apiUrl url api for upload  
 * @param {string} downloadUrl download url api for fetching the uploaded file  
 * @param {string} id unique id for the input
 * @param {string} accept type of files that can be accepted by input
 * @param {function} onChange function when file is changed
 */
const Uploader = (props) => {
    const [filename, set_filename] = useState(false)
    const [src, set_src] = useState('')
    const [loading, set_loading] = useState(false)
    const [error, set_error] = useState('')

    useEffect(() => {
        props.onChange(filename)
        downloadImage()
    }, [filename])

    const onFileChange = (event) => {
        let value = event.target.files[0];
        set_error('')

        // console.log("cek", value)
        // return
        if (value) {
            let exceed = ExceedUploadLimit(value)
            if (exceed.value) {
                let error = `Limit upload size is ${exceed.max_size / 1024} Kb`
                set_error(error);
                return;
            }

            set_loading(true);
            const formData = new FormData();
            formData.append('file', value);

            let url = process.env.REACT_APP_BASE_API_URL + props.apiUrl;

            axios.post(url, formData, Config({
                Authorization: 'Bearer ' + Cookie.get('token'),
                'content-type': 'multipart/form-data'
            })).then(response => {
                set_filename(response.data.data)
                // set_src(URL.createObjectURL(value))
            }).catch(error => {
                console.log(error)
                if (error.response) {
                    set_error(error.response.data.message)
                }
            }).finally(() => {
                set_loading(false)
            });

        } else {
            set_filename('')
            set_loading(false)
        }
    }
    const downloadImage = () => {
        if (filename) {
            let url = `${process.env.REACT_APP_BASE_API_URL}${props.downloadUrl}/${filename}`
            axios.get(url, {
                headers: {
                    Authorization: 'Bearer ' + Cookie.get('token'),
                },
                responseType: "blob",
            }).then(response => {
                set_src(URL.createObjectURL(response.data))
            }).catch(error => {
                console.log(error)
                if (error.response) {
                    set_error(error.response.data.message)
                }
            }).finally(() => {
                set_loading(false)
            });
        } else {
            set_src('')
        }
    }
    return (<>
        <div className="custom-file">
            <input id={props.id} type="file" className="custom-file-input" onChange={onFileChange} accept={props.accept} />
            <label className="custom-file-label" htmlFor={props.id}>{filename}</label>
        </div>
        {loading && <LoadingProgress />}

        {src && <div className="mt-2">
            <img src={src} style={{ maxHeight: 280, maxWidth: '100%' }} />
        </div>}
        <ErrorDiv error={error} />
    </>)
}

/**
 * 
 * @param {int} mpPaymentID  
 * @param {function} closeModal 
 * @param {function} refreshData refresh data in main page 
 * @param {function} t language
 * @returns 
 */
const UploadPaymentProof = (props) => {
    const [payment_proof, set_payment_proof] = useState('')
    const [account_name, set_account_name] = useState('')
    const [account_number, set_account_number] = useState('')
    const [mp_bank, set_mp_bank] = useState(null)

    const [mpBanks, set_mpBanks] = useState([])

    const [errors, set_errors] = useState({})
    const [submitting, set_submitting] = useState(false)

    useEffect(() => {
        getBanks()
    }, [])

    const getBanks = () => {
        axios.get(`${process.env.REACT_APP_BASE_API_URL}my-orders/getBanks`, Config({
            Authorization: `Bearer ${Cookie.get('token')}`
        })).then(response => {
            set_mpBanks(response.data.data.map((item) => (
                { value: item.id, label: item.name }
            )))
        }).catch(error => {
            console.log(error);
        }).finally(() => {
            //
        });
    }

    const validate = () => {
        let validate = true;
        let errors = {}

        if (!payment_proof) {
            validate = false;
            errors.payment_proof = "Payment proof is required"
        }
        if (!account_name) {
            validate = false;
            errors.account_name = "Account name is required"
        }
        if (!account_number) {
            validate = false;
            errors.account_number = "Account number is required"
        }
        if (!mp_bank) {
            validate = false;
            errors.mp_bank = "Bank is required"
        }

        set_errors(errors)
        return validate;
    }
    const submit = (e) => {
        e.preventDefault();
        if (!validate()) return;

        let data = {
            mp_payment_id: props.mpPaymentID,
            payment_proof,
            account_name,
            account_number,
            mp_bank_id: mp_bank.value,
        }

        set_submitting(true)
        let url = `${process.env.REACT_APP_BASE_API_URL}my-orders/savePaymentProof`
        axios.post(url, data, Config({
            Authorization: `Bearer ${Cookie.get('token')}`
        })).then(response => {
            props.closeModal()
            props.refreshData()
        }).catch(error => {
            console.log(error)
            if (error.response) {
                console.log(error.response)
            }
        }).finally(() => {
            set_submitting(false)
        });
    }

    return (
        <form onSubmit={submit}>
            <div className="form-group">
                <label className="color-374650 " htmlFor="payment_proof">Payment Proof</label>
                <Uploader apiUrl="my-orders/uploadPaymentProof" downloadUrl="my-orders/downloadPaymentProof" id="payment_proof" accept="image/*" onChange={(x) => set_payment_proof(x)} />
                <ErrorDiv error={errors.payment_proof} />
            </div>
            <div className="form-group">
                <label className="color-374650 " htmlFor="account_name">Account Name</label>
                <input id="account_name" type="text" className="form-control" onChange={(e) => set_account_name(e.target.value)} value={account_name} required />
                <ErrorDiv error={errors.account_name} />
            </div>
            <div className="form-group">
                <label className="color-374650 " htmlFor="account_number">Account Number</label>
                <input id="account_number" type="text" className="form-control" onChange={(e) => set_account_number(e.target.value)} value={account_number} required />
                <ErrorDiv error={errors.account_number} />
            </div>
            <div className="form-group">
                <label className="color-374650 " htmlFor="mp_bank">Bank</label>
                <Select id="mp_bank" value={mp_bank} options={mpBanks} onChange={(opt) => set_mp_bank(opt)} required />
                <ErrorDiv error={errors.mp_bank} />
            </div>

            <div className="row mt-3">
                <div className="col-6">
                    <button type="button" onClick={props.closeModal} className="btn btn-block border-707070 color-374650 font-weight-bold ">{props.t("general.cancel")}</button>
                </div>
                <div className="col-6">
                    <button type="submit" disabled={submitting} className="btn btn-block bgc-00896A text-white font-weight-bold ">{props.t("general.send")}</button>
                </div>
            </div>
        </form>
    )
}

export default UploadPaymentProof