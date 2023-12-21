import axios from 'axios';
import React from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import Config from '../components/axios/Config';
import Section from '../pages/cms/Section';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

const WidgetTab = ({ data }) => {

    const [data_tab, set_data_tab] = useState(null)
    const [selected, set_selected] = useState(0)
    useEffect(() => {
        if (data.tab_structur.length > 0) getTab(data.tab_structur)
        else return
    }, [])


    const getIdTab = (item) => {
        let arr = [];
        item.map((i) => {
            arr = [...arr, i.id]
        })
        return arr;
    }


    const getTab = (record) => {
        let url = `${process.env.REACT_APP_BASE_API_URL}cms/tabsWithComponents`
        let params = {
            ids: getIdTab(record)
        }
        axios.post(url, params, Config({})).then(res => {
            if (res.data.data.length > 0) {
                res.data.data.forEach(item => {
                    item.sections.forEach(section => {
                        section.rows.forEach(row => {
                            row.columns.forEach(column => {
                                column.components.forEach(component => {
                                    component.value = JSON.parse(component.value)
                                    if (component.style) component.style = JSON.parse(component.style) || {}
                                })
                                column.style = JSON.parse(column.style) || {}
                            })
                            row.style = JSON.parse(row.style) || {}
                        })
                        section.style = JSON.parse(section.style) || {}
                    });
                    // item.style = JSON.parse(item.style) || {}
                })
            }
            set_data_tab(res.data.data)
            // console.log(res.data.data)
        }).catch((error) => {
            console.log(error);
        });
    }

    const onSelect = (id) => {
        set_selected(id)
    }



    return (
        <div>
            <style>{`
                .nav-tabs .nav-link {
                    margin-right: ${data.margin_between};
                    background-color:${data.background_color};
                    color:${data.text_color};
                }
                .nav-tabs .nav-link.active {
                    background-color:${data.active_background_color};
                    border-bottom:${data.border_bottom};
                    border-top:${data.border_top};
                    border-left:${data.border_left};
                    border-right:${data.border_right};
                    border-style: solid;
                    border-color: ${data.border_color};
                    font-weight:700;                    
                    color: ${data.text_color};
                }
                .nav-tabs .nav-link:hover {
                    background-color:${data.hover_background_color} ; 
                }
                .nav-tabs a {
                    color:${data.text_color};
                    font-size:${data.font_size};
                    padding-top:${data.padding_top};
                    padding-bottom:${data.padding_bottom};
                    padding-left:${data.padding_left};
                    padding-right:${data.padding_right};
                }
                .nav-tabs .nav-link{
                    border-bottom:${data.border_bottom};
                    border-top:${data.border_top};
                    border-left:${data.border_left};
                    border-right:${data.border_right};
                    border-style: solid;
                    border-color: ${data.border_color};
                }
              
            `}</style>
            {data.tab_alignment === "Horizontal" ?
                <Tabs>
                    {data_tab && data_tab.map((section) => (
                        <Tab eventKey={section.title} title={section.title}>
                            {section?.sections.map((item) => (<>
                                <Section key={item.id} section={item} />
                            </>
                            ))}
                        </Tab>
                    ))}
                </Tabs>
                :
                <>
                    <div class="row">
                        <div class="col-3">
                            {data_tab && data_tab.map((section, index) => (
                                <div
                                    className="nav flex-column nav-tabs"
                                    id="v-pills-tab"
                                    role="tablist"
                                    aria-orientation="vertical"
                                >
                                    <button
                                        onClick={() => onSelect(index)}
                                        className={`nav-link tab-border-header ${selected === index ? "active" : ""}`}
                                        id={"v-pills-" + section.id + "-tab"}
                                        data-toggle="pill"
                                        data-target={"#v-pills-" + section.id + index}
                                        type="button"
                                        role="tab"
                                        aria-controls={"v-pills-" + section.id}
                                        aria-selected={`${selected === index ? "true" : "false"}`}>
                                        {section.title}
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="col-9">
                            {data_tab && data_tab.map((section, index) => (
                                <div
                                    className="tab-content"
                                    id="v-pills-tabContent"
                                >
                                    {section?.sections.map((item) => (
                                        <div
                                            className={`tab-pane fade show ${selected === index ? "active" : ""} `}
                                            id={"v-pills-" + section.id + index}
                                            role="tabpanel"
                                            aria-labelledby={"v-pills-" + section.id + "-tab"}
                                        >
                                            <Section key={item.id} section={item} type="tab" />
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            }
            {/* </div> */}
        </div >
    );
}

export default WidgetTab;
