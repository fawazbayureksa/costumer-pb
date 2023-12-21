import {Modal} from 'react-bootstrap'

/**
 * 
 * @param {bool} show show modal
 * @param {function} onHide on hide function
 * @param {object} data selected image data
 *  
 */
const ImageLightbox =(props)=>{

    return(<>
        <style>{`
            .modal-backdrop.show {
                opacity: .8;
            }
        `}</style>
        <Modal centered size="xl" show={props.show} onHide={props.onHide}>
            <Modal.Body className="text-center">
                <img src={props.data.src} alt={props.data.name} className="object-fit-cover" style={{maxWidth: '100%'}}/>
            </Modal.Body>
        </Modal>
    </>)
}

export default ImageLightbox