import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import $ from "jquery";

class Nested extends PureComponent {
    componentDidMount() {
        for (let i = 0; i < $('.caret').length; i++) {
            $(`.caret:eq(${i})`).unbind();
            $(`.caret:eq(${i})`).click(() => {
                $(`.caret:eq(${i})`).next('.nested').toggle('active');
            });
        }
    }

    render() {
        return (
            <ul className="nested list-unstyled pl-3">
                {this.props.data.map((value, index, array) => (
                    <div key={value.id}>
                        {(
                            typeof value[this.props.childAttr] !== 'undefined' &&
                            value[this.props.childAttr] !== undefined &&
                            value[this.props.childAttr] !== null &&
                            value[this.props.childAttr] !== ''
                        ) && value[this.props.childAttr].length > 0 ?
                            <>
                                <li
                                    className={`caret ${this.props.className}`}
                                    style={{marginTop: index === 0 ? 0 : this.props.margin}}
                                    onClick={event => (typeof this.props.onClick === 'function') && this.props.onClick(event, value)}
                                >{value[this.props.nameAttr]}</li>
                                <Nested
                                    data={value[this.props.childAttr]}
                                    childAttr={this.props.childAttr}
                                    nameAttr={this.props.nameAttr}
                                    className={this.props.className}
                                    margin={this.props.margin}
                                    onClick={this.props.onClick}
                                />
                            </> :
                            <li
                                className={this.props.className}
                                style={{marginTop: this.props.margin}}
                                onClick={event => (typeof this.props.onClick === 'function') && this.props.onClick(event, value)}
                            >{value[this.props.nameAttr]}</li>
                        }
                    </div>
                ))}
            </ul>
        );
    }
}

Nested.propTypes = {
    data: PropTypes.array.isRequired,
    childAttr: PropTypes.string,
    nameAttr: PropTypes.string,
    className: PropTypes.string,
    margin: PropTypes.string,
    onClick: PropTypes.func,
};
Nested.defaultProps = {
    childAttr: 'child',
    nameAttr: 'name',
    margin: '1rem',
};

export default Nested;