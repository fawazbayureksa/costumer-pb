import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Config from "../components/axios/Config";
import update from 'immutability-helper'
import FormSection from "../components/template/FormSection";
import SwalToast from '../components/helpers/SwalToast';
import { Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";

/**
 * 
 * @param {object} data data for this component
 */
const Form = (props) => {
    const [form, set_form] = useState(null)
    const [component_values, set_component_values] = useState({})

    const [temp_id, set_temp_id] = useState(0)
    const [errors, set_errors] = useState({})

    const [confirmation_modal_show, set_confirmation_modal_show] = useState(false)

    const [t] = useTranslation()

    useEffect(() => {
        getForm()
    }, []);

    const getForm = () => {
        let param = {
            cms_form_id: props.data.cms_form_id,
        }
        axios.get(`${process.env.REACT_APP_BASE_API_URL}cms/getFormWithComponents`, Config({}, param)).then(response => {
            let component_values_temp = {}
            if (response.data.data && response.data.data.sections) {
                response.data.data.sections.forEach(section => {
                    section.rows.forEach(row => {
                        row.columns.forEach(column => {
                            column.components.forEach(component => {
                                if (component.setting_value !== "") component.setting_value = JSON.parse(component.setting_value) || {};
                                if (component.style !== "") component.style = JSON.parse(component.style) || {};
                                component_values_temp[component.id] = { value: "", setting_value: component.setting_value, type: component.type };
                            });
                            column.style = JSON.parse(column.style) || {};
                        })
                        row.style = JSON.parse(row.style) || {};
                    });
                    section.style = JSON.parse(section.style) || {};
                });
                response.data.data.appearance = JSON.parse(response.data.data.appearance) || {};
            }
            set_form(response.data.data);
            set_component_values(component_values_temp);
        }).catch(error => {
            console.error(error);
        }).finally(() => {
            //
        });
    }
    const validate = () => {
        let validate = true
        let errors = {}

        for (let x in component_values) {
            if (component_values[x].type === "checkbox") {
                if ((!component_values[x].value || component_values[x].value.length < 1) && component_values[x].setting_value.required_field === "yes") {
                    validate = false
                    errors[x] = `minimum 1 ${component_values[x].setting_value.label} are checked`
                }
            }
            else {
                if (!component_values[x].value && component_values[x].setting_value.required_field === "yes") {
                    validate = false
                    errors[x] = `${component_values[x].setting_value.label} is required`
                }
            }
        }
        set_errors(errors)
        return validate;
    }
    const setComponentValue = useCallback(
        (component_id, value, component_type) => {
            let component_temp = update(component_values, { [component_id]: { value: { $set: value } } })

            set_component_values(component_temp)
        },
        [component_values],
    )
    const save = (e) => {
        e.preventDefault()
        if (!validate()) return

        let component_values_temp = [];
        for (const k in component_values) {
            component_values_temp.push({
                cms_form_component_id: parseInt(k),
                value: component_values[k].value
            })
        }

        let data = {
            cms_form_id: form.id,
            component_values: component_values_temp
        }
        // console.log(data); return;

        if (form.submission_type === "save_to_database") {
            let url = `${process.env.REACT_APP_BASE_API_URL}cms/form/submit`
            axios.post(url, data, Config()).then(res => {
                if (form.form_confirmation_type === "sweet_alert") {
                    SwalToast.fire({ icon: "success", title: t('form.submitted_successfully') })
                } else if (form.form_confirmation_type === "modal") {
                    set_confirmation_modal_show(true)
                }
                clearForm()
            }).catch((error) => {
                console.log(error)
                if (error.response) {
                    console.log(error.response)
                }
                SwalToast.fire({ icon: "error", title: "Sorry we have a problem right now, please try again later" })
            })
        }
    }

    const clearForm = () => {
        set_temp_id(temp_id + 1)
        getForm()
    }

    return (
        <div id={`form-${props.data.cms_form_id}`} style={{ letterSpacing: 0 }}>
            {form &&
                <form onSubmit={save}>
                    {form.sections.map((section, index) => (
                        <FormSection key={section.id + temp_id} section={section} appearance={form.appearance} onChangeComponent={setComponentValue} errors={errors} />
                    ))}
                </form>
            }

            <Modal centered show={confirmation_modal_show} onHide={() => set_confirmation_modal_show(false)}>
                <Modal.Body className="text-center">
                    <div className="text-center"><i className="fas fa-check fa-7x color-0C9344" /></div>
                    <div className="mt-3 px-5 text-center">{t('form.submitted_successfully')}</div>
                    <div className="mt-3 text-center">
                        <button onClick={() => set_confirmation_modal_show(false)} className="w-100 btn bgc-0C9344 text-white">{t('general.close')}</button>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    )
}

export default Form