import React, { PureComponent } from "react";
import MyContext from "../MyContext";
import SectionStyle2 from "../../styles/SectionStyle";
import Row from "../../pages/cms/Row";
import Responsive from "../../components/helpers/Responsive";
/**
 * props: section, type (header, footer), sectionRef, stickyTop
 */
class TemplateSection extends PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            cssID: this.props.type + "_section_" + this.props.section.id,
            scrolled: false
        }
    }

    handleScroll = () => {
        if (window.pageYOffset > 140) {
            if (!this.state.scrolled) {
                this.setState({ scrolled: true });
            }
        } else {
            if (this.state.scrolled) {
                this.setState({ scrolled: false });
            }
        }
    }

    content = () => (
        <div ref={this.props.sectionRef} id={this.props.section.style.css_id || this.state.cssID} className={`${this.props.type} ${this.state.scrolled && this.props.section.style.sticky == 'yes' ? "sticky" : ""}`}>
            <div>
                {this.context.theme_settings && <SectionStyle2 style={this.props.section.style} themes={this.context.theme_settings}
                    cssID={this.props.section.style.css_id || this.state.cssID} stickyTop={this.props.stickyTop} />}

                {this.props.section.rows && this.props.section.rows.map((row) => (
                    <Row key={row.id} row={row} type={this.props.type} />
                ))}
            </div>
        </div>
    )

    render() {
        return (
            <Responsive desktop={
                this.props.section.style.visibility_desktop && this.content()
            } mobile={
                this.props.section.style.visibility_mobile && this.content()
            } />
        )
    }
}

TemplateSection.contextType = MyContext
export default TemplateSection