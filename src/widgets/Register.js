import React, {useEffect, useState} from "react";
import {Modal} from "react-bootstrap";
import {Redirect} from "react-router-dom";
import {useHistory} from "react-router-dom";
import AuthRoutePath from "../pages/auth/AuthRoutePath";

/**
 * 
 * @param {object} data data for this component
 */
const Register = (props) => {
    const history = useHistory();

    const [styles, set_styles] = useState({});
    const [modal_show, set_modal_show] = useState(false);

    useEffect(() => {
        console.log(props)
        let temp_styles = {};
        if (props.data.font_weight) {
            temp_styles.fontWeight = props.data.font_weight === 'semi_bold' ? 600 : props.data.font_weight
        }
        if (props.data.font_size) {
            temp_styles.fontSize = props.data.font_size
        }
        if (props.data.color) {
            temp_styles.color = props.data.color
        }
        set_styles(temp_styles);
    }, []);

    const open = () => {
        history.push(AuthRoutePath.REGISTER);
    }

    const close = () => {
        set_modal_show(false);
    }

    return (
        <>
            <p className="m-0 link" style={styles} onClick={open}>{props.data.text}</p>
            <Modal centered show={modal_show} onHide={close}>
                <Modal.Header className="bgc-ECECEC">
                    <Modal.Title className="font-weight-bold color-374650 text-center">Register</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="form-group">
                        <label htmlFor="name">Name</label>
                        <input type="text" className="form-control" name="name" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">E-mail</label>
                        <input type="email" className="form-control" name="email" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" className="form-control" name="password" required />
                    </div>
                    <button className="btn bgc-accent-color  font-weight-bold">Register</button>
                </Modal.Body>
            </Modal>
        
        </>
    );
}

export default Register