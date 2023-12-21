
import React, {PureComponent} from 'react';
import {TinyMceContent} from "../../../components/helpers/TinyMceEditor";

class SellerInformation extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {

        }
    }

    componentWillReceiveProps(nextProps, nextContext) {
        this.setState({...this.state, nextProps});
    }

    render() {
        return (
            <div className="bg-white shadow-graph rounded p-3 mt-4">
                <TinyMceContent className=" mt-3">
                    {this.props.parent.state.seller_informations[this.props.parent.state.currentTab].content}
                </TinyMceContent>
            </div>
        )
    }
}

export default SellerInformation