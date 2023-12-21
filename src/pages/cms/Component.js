import { PureComponent } from "react";
import Article from "../../widgets/Article";
import ArticleCarousel from "../../widgets/ArticleCarousel";
import Image from "../../widgets/Image";
import ImageCarousel from "../../widgets/ImageCarousel";
import ImageGallery from "../../widgets/ImageGallery";
import Notice from "../../widgets/Notice";
import Slider from "../../widgets/Slider";
import TextEditor from "../../widgets/TextEditor";
import Maps from "../../widgets/Maps";
import NavigationMenu from "../../widgets/NavigationMenu";
import LanguageSelector from "../../widgets/LanguageSelector";
import Separator from "../../widgets/Separator";
import ProductList from "../../widgets/ProductList";
import ProductFilter from "../../widgets/ProductFilter";
import ProductCarousel from "../../widgets/ProductCarousel";
import Form from "../../widgets/Form";
import Login from "../../widgets/Login";
import Cart from "../../widgets/Cart";
import Search from "../../widgets/Search";
import Order from "../../widgets/Order";
import Wishlist from "../../widgets/Wishlist";
import Notification from "../../widgets/Notification";
import Chat from "../../widgets/Chat";
import Button from "../../widgets/Button";
import AccordionWidget from "../../widgets/AccordionWidget";
import ComponentStyle from "../../styles/ComponentStyle";
import MyContext from "../../components/MyContext";
import Script from "../../widgets/Script";
import Icon from "../../widgets/Icon";
import { StyleRoot } from 'radium';
import AdvancedSlider from "../../widgets/AdvancedSlider";
import Tab from "../../widgets/Tab";

/**
 * props: type: (header, footer, body, mega_menu, product_list), component, animationStyles
 */
class Component extends PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            cssID: this.props.type + "_component_" + this.props.component.id
        }
    }

    getStyle = () => {
        let styleData = {}

        // needed for carousel plugin, it has bug where nothing is shown if column is display:flex and component does not define width
        if (this.props.component.type === "image_carousel" || this.props.component.type === "article_carousel" || this.props.component.type === "product_carousel") {
            styleData.width = '100%'
        }

        return styleData
    }

    widgets = () => (
        <div id={this.state.cssID} style={this.getStyle()}>
            {this.context.theme_settings && this.props.component.style && <ComponentStyle style={this.props.component.style} themes={this.context.theme_settings} cssID={this.state.cssID} />}
            {this.props.component.type === "text_editor" && <TextEditor data={this.props.component.value} themes={this.context.theme_settings} />}
            {this.props.component.type === "notice" && <Notice data={this.props.component.value} themes={this.context.theme_settings} />}
            {this.props.component.type === "image" && <Image data={this.props.component.value} themes={this.context.theme_settings} />}
            {this.props.component.type === "nav_menu" && <NavigationMenu data={this.props.component.value} themes={this.context.theme_settings} />}
            {this.props.component.type === "language_selector" && <LanguageSelector data={this.props.component.value} themes={this.context.theme_settings} />}
            {this.props.component.type === "image_gallery" && <ImageGallery data={this.props.component.value} themes={this.context.theme_settings} />}
            {this.props.component.type === "image_carousel" && <ImageCarousel data={this.props.component.value} themes={this.context.theme_settings} />}
            {this.props.component.type === "article" && <Article data={this.props.component.value} themes={this.context.theme_settings} />}
            {this.props.component.type === "article_carousel" && <ArticleCarousel data={this.props.component.value} themes={this.context.theme_settings} />}
            {this.props.component.type === "advanced_slider" && <AdvancedSlider data={this.props.component.value} themes={this.context.theme_settings} />}
            {this.props.component.type === "slider_banner" && <Slider data={this.props.component.value} themes={this.context.theme_settings} />}
            {this.props.component.type === "form" && <Form data={this.props.component.value} themes={this.context.theme_settings} />}
            {this.props.component.type === "map" && <Maps data={this.props.component.value} themes={this.context.theme_settings} />}
            {this.props.component.type === "separator" && <Separator data={this.props.component.value} themes={this.context.theme_settings} />}
            {this.props.component.type === "login" && <Login data={this.props.component.value} themes={this.context.theme_settings} />}
            {this.props.component.type === "cart" && <Cart data={this.props.component.value} themes={this.context.theme_settings} />}
            {this.props.component.type === "search" && <Search data={this.props.component.value} themes={this.context.theme_settings} />}
            {this.props.component.type === "wishlist" && <Wishlist data={this.props.component.value} themes={this.context.theme_settings} />}
            {this.props.component.type === "order" && <Order data={this.props.component.value} themes={this.context.theme_settings} />}
            {this.props.component.type === "notification" && <Notification data={this.props.component.value} themes={this.context.theme_settings} />}
            {this.props.component.type === "chat" && <Chat data={this.props.component.value} themes={this.context.theme_settings} />}
            {this.props.component.type === "product_list" && <ProductList id={this.props.component.id} data={this.props.component.value} themes={this.context.theme_settings} />}
            {this.props.component.type === "product_filter" && <ProductFilter data={this.props.component.value} themes={this.context.theme_settings} />}
            {this.props.component.type === "product_carousel" && <ProductCarousel data={this.props.component.value} themes={this.context.theme_settings} />}
            {this.props.component.type === "button" && <Button type="link" data={this.props.component.value} themes={this.context.theme_settings} />}
            {this.props.component.type === "accordion" && <AccordionWidget id={this.props.component.id} data={this.props.component.value} themes={this.context.theme_settings} />}
            {this.props.component.type === "script" && <Script data={this.props.component.value} themes={this.context.theme_settings} />}
            {this.props.component.type === "icon" && <Icon data={this.props.component.value} themes={this.context.theme_settings} />}
            {this.props.component.type === "tab" && <Tab data={this.props.component.value} themes={this.context.theme_settings} />}
        </div>
    )
    render() {
        return (
            <>
                {this.props.component.style && this.props.component.style.animation_type ?
                    <StyleRoot style={[this.props.animationStyles[this.props.component.style.animation_type], { animationDuration: `${this.props.component.style.speed_of_animation ? this.props.component.style.speed_of_animation : 1}s` }]}>
                        {this.widgets()}
                    </StyleRoot> :
                    this.widgets()
                }
            </>
        )
    }
}

Component.contextType = MyContext
export default Component