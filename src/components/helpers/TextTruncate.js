import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';

class TextTruncate extends PureComponent {
    render() {
        return (
            <div className={this.props.className} style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: this.props.lineClamp.toString(),
                WebkitBoxOrient: 'vertical',
                wordBreak: 'break-word',
            }}>{this.props.children}</div>
        );
    }
}

TextTruncate.propTypes = {
    className: PropTypes.string,
    lineClamp: PropTypes.number.isRequired
};

export default TextTruncate;