import React, { PureComponent } from 'react';
import Cookie from 'js-cookie';
import axios from 'axios'
import TemplateSection from './TemplateSection';
import Config from '../axios/Config';

// props: setStickyTop
class Header extends PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            data: null,

            sectionRefs: [],
            sticky_tops: [],
        }
    }
    componentDidMount() {
        this.getHeader()

    }
    componentDidUpdate(prevProps, prevState) {
        if (prevState.data !== this.state.data) {
            if (this.timeout) clearTimeout(this.timeout)
            this.timeout = setTimeout(() => {
                this.getStickyTops();
            }, 1000);
        }
        if (prevState.sticky_tops !== this.state.sticky_tops) {
            if (this.state.sticky_tops.length > 0) {
                this.props.setStickyTop(this.state.sticky_tops[this.state.sticky_tops.length - 1])
            }
        }
    }
    getHeader = () => {
        let url = `${process.env.REACT_APP_BASE_API_URL}template/getHeader`
        let params = {
            language_code: Cookie.get("language_code"),
        }
        axios.get(url, Config({}, params)).then(res => {

            let sectionRefs = []
            if (res.data.data) {
                if (res.data.data.sections) {
                    res.data.data.sections.forEach(section => {
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
                        sectionRefs.push(React.createRef())
                    });
                }
            }

            this.setState({
                data: res.data.data,
                sectionRefs: sectionRefs
            })
        }).catch((error) => {
            console.log(error)
            if (error.response) console.log(error.response)
        })
    }
    getStickyTops = () => {
        if (!this.state.data || !this.state.data.sections) return;

        let total = [];
        let cumulativeStickyTop = 0;

        for (let h = 0; h < this.state.data.sections.length; h++) {
            total.push(0)

            if (!(this.state.data.sections[h].style.sticky === "yes")) continue;
            if (!this.state.sectionRefs[h] || !this.state.sectionRefs[h].current) continue;

            total[h] = cumulativeStickyTop

            cumulativeStickyTop += this.state.sectionRefs[h].current.offsetHeight
        }
        total.push(cumulativeStickyTop) // set last cumulative for context
        console.log("sticky_tops", total)
        this.setState({
            sticky_tops: total
        })
    }

    render() {
        return (<>
            {this.state.data && this.state.data.sections && this.state.data.sections.map((section, index) => (
                <TemplateSection key={section.id} section={section} type="header" sectionRef={this.state.sectionRefs[index]} index={index}
                    stickyTop={this.state.sticky_tops[index]} />
            ))}
        </>)
    }
}

export default Header;