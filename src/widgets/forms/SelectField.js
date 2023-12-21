import ErrorDiv from "../../components/helpers/ErrorDiv";
import Select from 'react-select'

const SelectField = (props) => {
    const label=()=>(
        <label htmlFor={`select-${props.data.id}`} className="" style={{
            color: props.appearance.field_label_color || '#000000',
            marginBottom: props.appearance.label_margin_bottom
        }}>{props.data.setting_value.label || ''}</label>
    )
    const styleVal = {
        color: props.appearance.field_text_color || '#000000',
        borderWidth: props.appearance.field_border_size || 0,
        borderColor: props.appearance.field_border_color || '#000000',
        borderRadius: props.appearance.field_border_radius || 0,
    }
    const reactSelectStyles = {
        control: (provided, state) => ({
            ...provided,
            ...styleVal,
            backgroundColor: props.appearance.field_background_color || '#FFFFFF',
            cursor: 'pointer',
            minWidth: 100,
        }),
        singleValue: (provided, state) => ({
            ...provided,
            ...styleVal,
            backgroundColor: props.appearance.field_background_color || '#FFFFFF',
        }),
        input: (provided, state) => ({
            ...provided,
            ...styleVal,
            backgroundColor: props.appearance.field_background_color || '#FFFFFF',
        }),
        valueContainer: (provided, state) => ({
            ...provided,
            ...styleVal,
            backgroundColor: props.appearance.field_background_color || '#FFFFFF',
        }),
        option: (provided, state) => ({
            ...provided,
            ...styleVal,
            cursor: 'pointer',
            fontSize: "75%",
        }),
        placeholder: (provided, state) => ({
            ...provided,
            fontSize: "80%",
        }),
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: '----',
    }

    return (
        <div style={{
            marginBottom: props.appearance.form_group_margin_bottom
        }}>
            {(props.appearance.label_position === 'above' && props.data.setting_value.label) && label()}
            
            <Select
                id={`select-${props.data.id}`}
                className=""
                placeholder={props.data.setting_value.placeholder}
                styles={reactSelectStyles}
                options={props.data.setting_value.options}
                onChange={objValue => props.onChangeComponent(props.data.id, objValue.value, props.data.type)}
            />
            {(props.appearance.label_position === 'below' && props.data.setting_value.label) && label()}
            
            <ErrorDiv error={props.errors[props.data.id]} />
        </div>
    );
};

export default SelectField