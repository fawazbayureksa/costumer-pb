import { Component } from "react"
import { memo, useCallback, useEffect, useState } from "react"
import { Modal } from "react-bootstrap"
import IsImage from "../../../components/helpers/IsImage"

/**
 * 
 * @param {string} source url of image source 
 * @param {string} name alternative name which first character to be used as image if source doesn't exist
 * @returns 
 */
export const ProfilePicture = memo((props) => {
    const [type, set_type] = useState(null)

    useEffect(() => {
        if (props.source) set_type("source")
        else if (props.name) set_type("name")
    }, [props])

    const errorImage = useCallback(() => {
        set_type('name')
    })

    if (type === "source") return (
        <img src={props.source} className="rounded-circle" width={45} height={45} style={{ objectFit: 'cover' }} onError={errorImage} />
    )
    else if (type === "name") return (
        <div className="bg-dark d-flex align-items-center justify-content-center rounded-circle" style={{ width: 45, height: 45 }}>
            <p className="m-0 text-white font-weight-bold">{props.name.charAt(0).toUpperCase()}</p>
        </div>
    )
    else return <></>
})

/**
 * props: context, onPayloadChange, onWsChange
 */
export class DetectContext extends Component {
    componentDidMount() {
        if (!this.props.context.ws) return;
        this.props.onWsChange(this.props.context.ws)
    }

    componentDidUpdate(prevProps) {
        if (prevProps.context !== this.props.context) {
            if (prevProps.context.payload !== this.props.context.payload) {
                if (!this.props.context.payload) return;
                this.props.onPayloadChange(this.props.context.payload)
            }
            else if (prevProps.context.ws !== this.props.context.ws) {
                if (!this.props.context.ws) return;
                this.props.onWsChange(this.props.context.ws)
            }
        }
    }

    render() {
        return (
            <></>
        )
    }
}

/**
 * Component for showing uploaded response media
 * @param {integer} index the index number
 * @param {string} src local blob url of media
 * @param {string} filename filename of media
 * @param {function} removeAttachment
 * @returns 
 */
export const ChatAttachment = (props) => {
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
                        onError={event => event.target.src = `/images/placeholder.gif`}
                        alt={props.media} style={{ maxWidth: '100%' }} className="object-fit-cover"
                    />
                </Modal.Body>
            </Modal>
            <img
                src={props.src}
                onError={event => event.target.src = `/images/placeholder.gif`}
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
                    src="/images/files.png"
                    alt={props.media} className="w-100 object-fit-cover"
                />
                <div className="link overflow-hidden" style={{ whiteSpace: 'nowrap' }}>{props.filename}</div>
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
 * Component for showing response media
 * @param {object} message object message
 * @returns 
 */
export const ChatAttachment2 = ({ message }) => {
    const [showImagePreview, setShowImagePreview] = useState(false)

    const downloadFile = async () => {
        const link = document.createElement('a');
        link.href = source();
        link.setAttribute('download', message.message);
        document.body.appendChild(link);
        link.click();
        link.remove();
    }

    const source = () => {
        return 'data:;base64,' + message.data
    }
    if (IsImage(message.message)) return (<div className="position-relative">
        <Modal size="lg" centered show={showImagePreview} onHide={() => setShowImagePreview(false)}>
            <Modal.Body style={{ textAlign: 'center' }}>
                <img
                    src={source()}
                    onError={event => event.target.src = `/images/placeholder.gif`}
                    alt={message.message} style={{ maxWidth: '100%' }} className="object-fit-cover"
                />
            </Modal.Body>
        </Modal>
        <img
            src={source()}
            onError={event => event.target.src = `/images/placeholder.gif`}
            alt={message.message} className="w-100 object-fit-cover"
            onClick={event => setShowImagePreview(true)}
            style={{ maxHeight: '15rem' }}
        />
    </div>)
    else return (<div className="position-relative">
        <div className="text-center" style={{ maxWidth: '100%' }} onClick={downloadFile}>
            <img
                src="/images/files.png"
                style={{ maxHeight: '6rem' }}
                alt={message.message} className="object-fit-cover"
            />
            <div className="link overflow-hidden" style={{ whiteSpace: 'nowrap' }}>{message.message}</div>
        </div>
    </div>)
}

export const ChatMessageType = {
    Text: 'text',
    Product: 'product',
    Attachment: 'attachment',
}