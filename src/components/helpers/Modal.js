import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';

class Modal extends PureComponent {
    render() {
        return (
            <div className="modal fade" id={this.props.modalId} tabIndex="-1" role="dialog" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered" style={{maxWidth: this.props.maxWidth}} role="document">
                    <div className="modal-content p-3">
                        <div className="headers">
                            <div className="text-center">
                                <h5 className="modal-title color-374650 font-weight-bold">{this.props.title}</h5>
                            </div>
                            {
                                this.props.close ? null : 
                                <button type="button" className="close p-3" data-dismiss="modal" aria-label="Close" style={{position: 'absolute', top: 0, right: 0}}>
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            }
                            
                        </div>
                        <div className="pt-2">
                            {this.props.children}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

Modal.propTypes = {
    modalId: PropTypes.string.isRequired,
    maxWidth: PropTypes.number,
    title: PropTypes.string,
};
Modal.defaultProps = {
    maxWidth: 400
};
export default Modal;