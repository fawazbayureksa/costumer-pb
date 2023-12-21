import { useState } from "react";
import ReactDatePicker from "react-datepicker";
import ErrorDiv from "../../components/helpers/ErrorDiv";

const Date = (props) => {
    const [date, set_date] = useState('')

    const label=()=>(
        <label htmlFor={`date-${props.data.id}`} className="" style={{
            color: props.appearance.field_label_color || '#000000',
            marginBottom: props.appearance.label_margin_bottom
        }}>{props.data.setting_value.label || ''}</label>
    )

    const onChange=(value)=>{
        set_date(value)
        props.onChangeComponent(props.data.id, value, props.data.type)
    }
    return (
        <>
            <div style={{
                marginBottom: props.appearance.form_group_margin_bottom
            }}>
                {(props.appearance.label_position === 'above' && props.data.setting_value.label) && label()}
                
                <div>
                    <ReactDatePicker 
                        selected={date} 
                        id={`date-${props.data.id}`}                     
                        onChange={onChange}
                        autoComplete="off" 
                        className="form-control" 
                        wrapperClassName="w-100"
                        placeholder={props.data.setting_value.placeholder || ''}
                        showMonthDropdown 
                        showYearDropdown 
                        dropdownMode="select"
                        dateFormat={`dd MMM yyyy ${props.data.setting_value.with_time ? "HH:mm" : ""}`}
                        showTimeInput={props.data.setting_value.with_time}
                        style={{
                            color: props.appearance.field_text_color || '#000000',
                            backgroundColor: props.appearance.field_background_color || '#FFFFFF',
                            borderWidth: props.appearance.field_border_size || 0,
                            borderColor: props.appearance.field_border_color || '#000000',
                            borderRadius: props.appearance.field_border_radius || 0,
                        }}
                    />
                </div>
                {(props.appearance.label_position === 'below' && props.data.setting_value.label) && label()}
                
                <ErrorDiv error={props.errors[props.data.id]} />
            </div>
        </>
    );
};

export default Date