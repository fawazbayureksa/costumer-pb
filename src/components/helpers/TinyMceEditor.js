import React, { PureComponent, useState } from 'react';
import PropTypes from 'prop-types';
import { Editor } from '@tinymce/tinymce-react';
import { Modal } from "react-bootstrap";
import ReactHtmlParser, { convertNodeToElement } from 'react-html-parser';
import ErrorDiv from './ErrorDiv';
import MediaGallery from './MediaGalery';

/**
 * 
 * @param {function} onAdd function to run when adding image
 */
const InsertLink = (props) => {

    const [src, set_src] = useState('')
    const [alt_text, set_alt_text] = useState('')
    const [title, set_title] = useState('')
    const [errors, set_errors] = useState({})

    const setter = (set) => (e) => {
        set(e.target.value)
    }

    const checkImageExists = () => {
        return new Promise((resolve, reject) => {
            set_errors({})

            let img = new Image();
            img.onload = () => {
                resolve(true)
            };
            img.onerror = () => {
                let errors = {};
                errors.src = ["Wrong image source"]
                set_errors(errors)

                reject();
            };

            img.src = src;
        })

    }

    const addImageFromLink = () => {
        checkImageExists().then(() => {
            props.onAdd(src, alt_text, title)

            set_src('')
            set_alt_text('')
            set_title('')
        }).catch(() => {
        })
    }

    return (<>
        <div>
            <div>Source</div>
            <div className="mt-1"><input className="form-control" name="src" value={src} onChange={setter(set_src)} /></div>
            <ErrorDiv error={errors.src} />
        </div>
        <div className="mt-2">
            <div>Alternative text</div>
            <div className="mt-1"><input className="form-control" name="alt_text" value={alt_text} onChange={setter(set_alt_text)} /></div>
        </div>
        <div className="mt-2">
            <div>Title</div>
            <div className="mt-1"><input className="form-control" name="title" value={title} onChange={setter(set_title)} /></div>
        </div>
        {src && <button type="button" className="mt-3 btn w-100 bgc-0C9344 text-white" onClick={addImageFromLink}>Add Image</button>}
    </>)
}

export default class TinyMceEditor extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            insert_image_type: this.InsertImageTypeList[0].key,
            errors: {},
            modal_show: false,
        }

        this.addImageFromMediaGallery = null
        this.addImageFromLink = null
    }

    componentDidMount() {

    }
    onEditorChange = (content, editor) => {
        this.props.onEditorChange(content, editor);
    }
    RowFunction = {
        onSelectedImageChange: (record) => {
            this.setState({
                selected_image: record
            })
        }
    }

    InsertImageTypeList = [
        { key: 'media_gallery', text: 'Media Gallery', },
        { key: 'insert_link', text: 'Insert Link', },
    ]
    setInsertImageType = (e) => {
        this.setState({
            insert_image_type: e.target.id
        })
    }

    setter = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }
    linkKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            this.addImageFromLink()
        }
    }
    mediaGalleryKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()
        }
    }
    closeModal = () => {
        this.setState({
            modal_show: false
        })
    }
    render() {
        return (
            <>
                <Editor
                    apiKey={process.env.REACT_APP_TINY_MCE_API_KEY}
                    initialValue={this.props.initialValue || ""}
                    init={{
                        height: this.props.height,
                        menubar: true,
                        menu: {
                            file: { title: 'File', items: 'newdocument restoredraft | preview | print ' },
                            edit: { title: 'Edit', items: 'undo redo | cut copy paste | selectall | searchreplace' },
                            view: { title: 'View', items: 'code | visualaid visualchars visualblocks | spellchecker | preview fullscreen' },
                            insert: { title: 'Insert', items: 'link media template codesample inserttable | charmap emoticons hr | pagebreak nonbreaking anchor toc | insertdatetime' },
                            format: { title: 'Format', items: 'bold italic underline strikethrough superscript subscript codeformat | formats blockformats fontformats fontsizes align | forecolor backcolor | removeformat' },
                            tools: { title: 'Tools', items: 'spellchecker spellcheckerlanguage | code wordcount' },
                            table: { title: 'Table', items: 'inserttable | cell row column | tableprops deletetable' },
                            help: { title: 'Help', items: 'help' }
                        },
                        plugins: [
                            'advlist autolink lists link image charmap print preview anchor',
                            'searchreplace visualblocks code fullscreen',
                            'insertdatetime media table paste code help wordcount'
                        ],
                        toolbar: 'undo redo | formatselect | bold italic forecolor backcolor | customImageButton link media | table | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | preview | removeformat | help',
                        // skin: (window.matchMedia("(prefers-color-scheme: dark)").matches ? "oxide-dark" : ""),
                        // content_css: (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : ""),
                        image_advtab: true,
                        setup: (editor) => {
                            if (this.props.setInsertScript) {
                                this.props.setInsertScript((script) => {
                                    editor.insertContent(`<label>{{${script}}}<label>`)
                                })
                            }
                            editor.ui.registry.addButton('customImageButton', {
                                icon: 'image',
                                tooltip: 'Pictures from Link',
                                onAction: (_) => {
                                    if (!this.addImageFromMediaGallery) {
                                        this.addImageFromMediaGallery = (selected, name) => {
                                            editor.insertContent(`<img src="${selected.src}" alt="${selected.filename}" title="${name}" style="max-width:100%;height:auto;width:auto;" />`)
                                            this.closeModal()
                                        }
                                    }
                                    if (!this.addImageFromLink) {
                                        this.addImageFromLink = (src, alt_text, title) => {
                                            editor.insertContent(`<img src="${src}" alt="${alt_text}" style="max-width:100%;height:auto;width:auto;" title="${title}" />`)
                                            this.closeModal()
                                        }
                                    }
                                    this.setState({
                                        modal_show: true
                                    })
                                },
                            });
                            editor.on('ObjectResized', function (e) {
                                if (e.target.nodeName == 'IMG') {
                                    // console.log(e.target, e.target.width, e.target.height, e.target.parentNode.offsetWidth);
                                    // $(target).attr('height', 'auto')
                                    // $(target).css('height', 'auto')
                                    // $(target).attr('data-mce-style', 'width:100%; height:auto;')
                                    let widthPercentage = e.target.width / e.target.parentNode.offsetWidth * 100
                                    if (widthPercentage > 100) {
                                        e.target.setAttribute('data-mce-style', 'width:100%; height:auto;');
                                    }
                                    else {
                                        e.target.setAttribute('data-mce-style', `width:${widthPercentage}%; height:auto;`);
                                    }

                                }
                            });
                        },
                        image_dimensions: false,
                        image_class_list: [
                            { title: 'Responsive', value: 'img-responsive' }
                        ],

                        content_style: `
                            img {
                                max-width: 100%;
                                width: auto;
                                height: auto;
                            }
                            iframe {
                                max-width: 100%;
                            }
                        `,
                        ...this.props.init,
                    }}
                    onEditorChange={this.onEditorChange}
                />
                <Modal centered show={this.state.modal_show} onHide={this.closeModal} size="xl">
                    <Modal.Header>
                        <Modal.Title>Insert Image</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <style>{`
                        .tiny-mce-tabs.tabList{
                            border-bottom: 3px solid #dee2e6;
                        }
                        .tiny-mce-tabs.tabList .active{
                            background-color:#dee2e6;
                            color: #2196F3;
                            font-weight: bold;
                        }
                        
                        .error-message{
                            width: 100%;
                            margin-top: .25rem;
                            font-size: 80%;
                            color: #dc3545;
                            margin-left: 0.3rem;
                        }
                    `}</style>
                        <div className={`d-flex tiny-mce-tabs tabList mb-3`}>
                            {this.InsertImageTypeList.map((item) => (
                                <div className={`${this.state.insert_image_type === item.key && "active"} py-3 px-3 mr-3`} style={{ cursor: 'pointer' }}
                                    onClick={this.setInsertImageType} id={item.key} key={item.key}>{item.text}</div>
                            ))}
                        </div>

                        <div
                            hidden={this.state.insert_image_type !== "insert_link"}
                            onKeyPress={this.linkKeyPress}>
                            <InsertLink onAdd={this.addImageFromLink} />
                        </div>

                        <div hidden={this.state.insert_image_type !== "media_gallery"} onKeyPress={this.mediaGalleryKeyPress}>
                            <MediaGallery onUse={this.addImageFromMediaGallery} onClose={this.closeModal} />
                        </div>

                    </Modal.Body>
                </Modal>
            </>
        );
    }
}

TinyMceEditor.propTypes = {
    initialValue: PropTypes.string,
    init: PropTypes.object,
    onEditorChange: PropTypes.func.isRequired,
    height: PropTypes.string,
};
TinyMceEditor.defaultProps = {
    height: '400px'
};


export const TinyMceContent = (props) => {
    return (
        <>
            <style>{`
                .tiny-mce-content-provider img {
                    max-width: 100%;
                    width: auto;
                    height: auto;
                }
                .tiny-mce-content-provider iframe {
                    max-width: 100%;
                }
                .tiny-mce-content-provider html, .tiny-mce-content-provider body {
                    background-color: transparent !important;
                }
            `}</style>
            <div className={`tiny-mce-content-provider ${props.className || ''}`} style={props.style} id={props.id}>{ReactHtmlParser(props.children)}</div>
        </>
    )
}
export const TinyMcePreview = (props) => {
    const transformFunc = (node, index) => {
        if (node.type === "tag") {
            node.name = "span"
            return convertNodeToElement(node, index, transformFunc)
        }
    }
    return (
        <div className={`${props.className || ''}`} style={props.style} id={props.id}>
            {ReactHtmlParser(props.children, {
                transform: transformFunc
            })}
        </div>
    )
}