import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Cookie from "js-cookie";

class ManualSwitchLanguage extends PureComponent {
    constructor(props) {
        super(props);
        this.findingData = this.findingData.bind(this);
    }

    // multipleKey(total_split, value, local_lang) {
    //     if (total_split.length > 2) {
    //         total_split.shift();
    //         return this.multipleKey(total_split, value[total_split[0]], local_lang);
    //     } else {
    //         if (
    //             typeof value[total_split[0]] !== 'undefined' &&
    //             value[total_split[0]] !== undefined &&
    //             value[total_split[0]] !== null &&
    //             value[total_split[0]] !== ''
    //         ) return value[total_split[0]][total_split[1]] === local_lang;
    //         else {
    //             if (
    //                 typeof value[total_split[1]] !== 'undefined' &&
    //                 value[total_split[1]] !== undefined &&
    //                 value[total_split[1]] !== null &&
    //                 value[total_split[1]] !== ''
    //             ) {
    //                 return value[total_split[1]] === local_lang;
    //             } else return false;
    //         }
    //     }
    // }

    findingData() {
        return ManualSwitchLanguageFn(this.props.data, this.props.langAttr, this.props.valueAttr)        
    }

    render() {
        return (<>
            {this.findingData()}
        </>)
    }
}

ManualSwitchLanguage.propTypes = {
    data: PropTypes.array.isRequired,
    langAttr: PropTypes.string,
    valueAttr: PropTypes.string,
};
ManualSwitchLanguage.defaultProps = {
    langAttr: 'code',
    valueAttr: 'name'
};

export default ManualSwitchLanguage;


export const ManualSwitchLanguageFn=(data, langAttr, valueAttr)=>{  
    if (data.length > 0) {

        let local_lang = Cookie.get('language_code');
        if (local_lang) {
            let result = data.find((value, index, obj) => value[langAttr] === local_lang) // check for chosen language
            if (result) {
                return result[valueAttr];
            }
            else{
                result = data.find((value, index, obj) => value[langAttr] === "en") // check for english result 
                if (result) {
                    return result[valueAttr];
                }
            }
        }
        return data[0][valueAttr] // if no result found then get the first data
    }

    return null
}