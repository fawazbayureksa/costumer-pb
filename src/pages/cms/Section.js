import { PureComponent } from "react";
import MyContext from "../../components/MyContext";
import SectionStyle2 from "../../styles/SectionStyle";
import Row from "./Row";
import Responsive from "../../components/helpers/Responsive";

import Radium, { StyleRoot } from 'radium';
import * as animations from "react-animations";

const animationStyles = {}
const animationNames = []
for (let key in animations) {
    animationNames.push(key)
    animationStyles[key] = {
        animation: 'x',
        animationName: Radium.keyframes(animations[key], key)
    }
}

/**
 * props: section, type (body, product_list)
 */
class Section extends PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            cssID: "body_section_" + this.props.section.id
        }
    }

    content = () => (
        <StyleRoot>
            <div id={this.props.section.style.css_id || this.state.cssID} style={[animationStyles[this.props.section.style.animation_type], { animationDuration: `${this.props.section.style.speed_of_animation ? this.props.section.style.speed_of_animation : 1}s` }]}>
                <div>
                    {this.context.theme_settings && <SectionStyle2 type={this.props.type} style={this.props.section.style} themes={this.context.theme_settings}
                        cssID={this.props.section.style.css_id || this.state.cssID} />}

                    {this.props.section.rows && this.props.section.rows.map((row) => (
                        <Row key={row.id} row={row} animationStyles={animationStyles} type={this.props.type} />
                    ))}
                </div>
            </div>
        </StyleRoot>
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
Section.contextType = MyContext;
export default Section