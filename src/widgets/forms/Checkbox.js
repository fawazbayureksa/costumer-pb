import {useState, useEffect} from 'react'
import update from 'immutability-helper'
import ErrorDiv from "../../components/helpers/ErrorDiv";

const Checkbox = (props) => {
    const [values, set_values] = useState([])

    const label=()=>(
        <label htmlFor={`checkbox-${props.data.id}`} className="" style={{
            color: props.appearance.field_label_color || '#000000',
            marginBottom: props.appearance.label_margin_bottom
        }}>{props.data.setting_value.label || ''}</label>
    )

    const onChange=(e)=>{
        let index = e.target.getAttribute('index')

        let newValues = update(values, {
            [index]: {$set: e.target.checked}
        })
        set_values(newValues)     
        
        let newValuesOnChange = []
        props.data.setting_value.options.forEach((option, index)=>{
            if(newValues[index] && newValues[index] === true){
                newValuesOnChange.push(option.value)
            }
        }) 
        
        props.onChangeComponent(props.data.id, newValuesOnChange, props.data.type)
    }

    return (
        <div style={{
            marginBottom: props.appearance.form_group_margin_bottom
        }}>
            {(props.appearance.label_position === 'above' && props.data.setting_value.label) && label()}
            
            {
                Array.isArray(props.data.setting_value.options) &&
                props.data.setting_value.options.map((val, index) => (
                    <div key={`checkbox-${index}`} className="form-check form-control-md d-flex align-items-center">
                        <input
                            id={`checkbox-${props.data.id}-${index}`}
                            type="checkbox"
                            className="form-check-input"
                            placeholder={props.data.setting_value.placeholder || ''}
                            // value={val.value}
                            onChange={onChange}
                            style={{marginTop: 0}}
                            checked={values[index]}
                            index={index}
                        />
                        <label
                            className="form-check-label"
                            htmlFor={`checkbox-${props.data.id}-${index}`}
                            style={{
                                color: props.appearance.field_text_color || '#000000',
                                backgroundColor: props.appearance.field_background_color || '#FFFFFF',
                                borderWidth: props.appearance.field_border_size || 0,
                                borderColor: props.appearance.field_border_color || '#000000',
                                borderRadius: props.appearance.field_border_radius || 0,
                            }}
                        >{val.label}</label>
                    </div>
                ))
            }
            {(props.appearance.label_position === 'below' && props.data.setting_value.label) && label()}
            <ErrorDiv error={props.errors[props.data.id]} />
        </div>
    );
}

export default Checkbox