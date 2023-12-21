import React, { useEffect, useState } from 'react';
import Cookie from "js-cookie";
import axios from 'axios'
import Modal from 'react-bootstrap/Modal'
import IsImage from '../../../components/helpers/IsImage'
import { OrderRow } from '../customer/account-settings/my-orders/Helper';
import Config from '../../../components/axios/Config';

const errorImagePath = `/images/placeholder.gif`;
const fileImagePath = "/images/files.png";

/**
 * Component for showing response media
 * @param {integer} id ticket_response_media_id
 * @param {string} type img or file
 * @param {string} media filename of media
 * @returns 
 */
export const TicketAttachment = (props) => {
    const [showImagePreview, setShowImagePreview] = useState(false)
    const [src, setSrc] = useState('')

    useEffect(() => {
        if (!props.id) return;

        if (props.type === "img") {
            showImage()
        }
    }, [props.id])

    const getTicketAttachment = async () => {
        return await axios.get(`${process.env.REACT_APP_BASE_API_URL}drs/ticket/attachment/${props.id}`, {
            responseType: 'blob',
            headers: {
                Authorization: 'Bearer ' + Cookie.get('token'),
            }
        }).then(response => {
            // console.log("image attachment ->",response.data);
            let data = URL.createObjectURL(response.data)

            return data
        }).catch(error => {
            console.error(error);
        });
    }

    const showImage = async () => {
        let data = await getTicketAttachment()
        setSrc(data)
    }

    const downloadFile = async () => {
        let data = await getTicketAttachment()
        const link = document.createElement('a');
        link.href = data;
        link.setAttribute('download', props.media);
        document.body.appendChild(link);
        link.click();
        link.remove();
    }

    if (props.type === 'img') return (<>
        <Modal centered show={showImagePreview} onHide={() => setShowImagePreview(false)}>
            <Modal.Body style={{ maxWidth: 700, textAlign: 'center' }}>
                <img
                    src={src}
                    onError={event => event.target.src = errorImagePath}
                    alt={props.media} style={{ maxWidth: '100%' }} className="object-fit-cover"
                />
            </Modal.Body>
        </Modal>
        <div className="link-attachment" onClick={event => setShowImagePreview(true)}>
            <img
                src={src}
                onError={event => event.target.src = errorImagePath}
                alt={props.media} className="w-100 object-fit-cover"
            />
            <p className="m-0 small overflow-hidden" style={{ whiteSpace: 'nowrap' }}>{props.media}</p>
        </div>
    </>)
    else if (props.type === "file") return (
        <div className="link-attachment" onClick={downloadFile}>
            <img
                src={fileImagePath}
                alt={props.media} className="w-100 object-fit-cover"
            />
            <p className="m-0 small overflow-hidden" style={{ whiteSpace: 'nowrap' }}>{props.media}</p>
        </div>
    )
    else return null
}

/**
 * Component for showing uploaded response media
 * @param {integer} index the index number
 * @param {string} src local blob url of media
 * @param {string} filename filename of media
 * @param {function} removeAttachment
 * @returns 
 */
export const TicketAttachmentForUpload = (props) => {
    const [showImagePreview, setShowImagePreview] = useState(false)

    const removeAttachment = () => {
        props.removeAttachment(props.index)
    }

    const downloadFile = async () => {
        const link = document.createElement('a');
        link.href = props.src;
        link.setAttribute('download', props.filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
    }

    if (IsImage(props.filename)) return (
        <div className="position-relative">
            <Modal centered show={showImagePreview} onHide={() => setShowImagePreview(false)}>
                <Modal.Body style={{ maxWidth: 700, textAlign: 'center' }}>
                    <img
                        src={props.src}
                        onError={event => event.target.src = errorImagePath}
                        alt={props.media} style={{ maxWidth: '100%' }} className="object-fit-cover"
                    />
                </Modal.Body>
            </Modal>
            <img
                src={props.src}
                onError={event => event.target.src = errorImagePath}
                alt="" className="w-100 temp-attachment object-fit-cover"
                onClick={event => setShowImagePreview(true)}
            />
            <a
                href="javascript:void(0)"
                className="text-decoration-none position-absolute px-2"
                style={{ top: 0, right: 0, zIndex: 200 }}
                onClick={removeAttachment}
            >&times;</a>
        </div>
    )
    else return (
        <div className="position-relative">
            <div className="link-attachment" onClick={downloadFile}>
                <img
                    src={fileImagePath}
                    alt={props.media} className="w-100 object-fit-cover"
                />
            </div>
            <a
                href="javascript:void(0)"
                className="text-decoration-none position-absolute px-2"
                style={{ top: 0, right: 0, zIndex: 200 }}
                onClick={removeAttachment}
            >&times;</a>
        </div>
    )
}

/**
 * 
 * @param {object} t language dictionary object for switching language
 * @param {object} transaction transaction data
 * @returns 
 */
export const TransactionOrderRow = ({ t, transaction }) => {
    const [config, setConfig] = useState(null)

    useEffect(() => {
        getMasterData()
    }, [])

    const getMasterData = () => {
        axios.get(`${process.env.REACT_APP_BASE_API_URL}my-orders/getMasterData`, Config({
            Authorization: `Bearer ${Cookie.get('token')}`
        })).then(response => {
            response.data.data.config = JSON.parse(response.data.data.config) || {};
            setConfig(response.data.data.config)
        }).catch(error => {
            console.log(error);
        }).finally(() => {
            //
        });
    }

    if (config) return (
        <OrderRow
            configType={config.type}
            t={t}
            transaction={transaction}
            // refreshData={this.getda}
            // review={this.review}
            showButton={false}
        />
    )
    else return null
}