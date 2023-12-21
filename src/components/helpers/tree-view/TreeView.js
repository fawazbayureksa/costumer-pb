import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Nested from "./Nested";

class TreeView extends PureComponent {
    render() {
        return (
            <ul className="tecta-trv-v1 list-unstyled">
                <style jsx="true">{`
                    .tecta-trv-v1 li {
                        cursor: pointer;
                        -webkit-user-select: none;
                        -moz-user-select: none;
                        -ms-user-select: none;
                        user-select: none;
                    }
                    .tecta-trv-v1 .nested {
                        display: none;
                    }
                    .tecta-trv-v1 .active {
                        display: block;
                    }
                `}</style>
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
                                    style={{ margin: `${this.props.margin} 0` }}
                                    onClick={event => (typeof this.props.onClick === 'function') && this.props.onClick(event, value)}
                                >{value[this.props.nameAttr]}</li>
                                <Nested
                                    data={value[this.props.childAttr]}
                                    childAttr={this.props.childAttr}
                                    nameAttr={this.props.nameAttr}
                                    className={this.props.className}
                                    margin={this.props.margin}
                                    onClick={this.props.onClickNested}
                                />
                            </> :
                            <li
                                className={this.props.className}
                                style={{ margin: `${this.props.margin} 0` }}
                                onClick={event => (typeof this.props.onClick === 'function') && this.props.onClick(event, value)}
                            >{value[this.props.nameAttr]}</li>
                        }
                    </div>
                ))}
            </ul>
        );
    }
}

TreeView.propTypes = {
    data: PropTypes.array.isRequired,
    childAttr: PropTypes.string,
    nameAttr: PropTypes.string,
    className: PropTypes.string,
    margin: PropTypes.string,
    onClick: PropTypes.func,
    onClickNested: PropTypes.func,
};
TreeView.defaultProps = {
    childAttr: 'child',
    nameAttr: 'name',
    margin: '1rem',
};

export default TreeView;