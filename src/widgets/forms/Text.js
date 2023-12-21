import ErrorDiv from "../../components/helpers/ErrorDiv";

const Text = (props) => {
    const label=()=>(
        <label htmlFor={`text-${props.data.id}`} className="" style={{
            color: props.appearance.field_label_color || '#000000',
            marginBottom: props.appearance.label_margin_bottom
        }}>{props.data.setting_value.label || ''}</label>
    )
    return (
        <>
            <div style={{
                marginBottom: props.appearance.form_group_margin_bottom
            }}>
                {(props.appearance.label_position === 'above' && props.data.setting_value.label) && label()}
                
                <input
                    id={`text-${props.data.id}`}
                    type="text"
                    className="form-control"
                    style={{
                        color: props.appearance.field_text_color || '#000000',
                        backgroundColor: props.appearance.field_background_color || '#FFFFFF',
                        borderWidth: props.appearance.field_border_size || 0,
                        borderColor: props.appearance.field_border_color || '#000000',
                        borderRadius: props.appearance.field_border_radius || 0,
                    }}
                    placeholder={props.data.setting_value.placeholder || ''}
                    onChange={(event) => props.onChangeComponent(props.data.id, event.target.value, props.data.type)}
                />
                {(props.appearance.label_position === 'below' && props.data.setting_value.label) && label()}
                
                <ErrorDiv error={props.errors[props.data.id]} />
            </div>
        </>
    );
};

export default Text