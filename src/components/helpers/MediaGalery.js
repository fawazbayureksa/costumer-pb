import { useEffect, useState } from "react";
import ErrorDiv from "./ErrorDiv";
import ExceedUploadLimit from "./ExceedUploadLimit";
import axios from 'axios';
import Config from "../axios/Config";
import Cookie from "js-cookie";
import Paginate from "./Paginate";
import CustomImage, { ImageGetPublicUrl, PublicStorageFolderPath } from "./CustomImage";
import LoadingProgress from "./LoadingProgress";
import { DateTimeFormat } from "./DateTimeFormat";
import { Form } from "react-bootstrap";

/**
 * 
 * @param {function} onUse when using selected image 
 * @param {function} onClose when closing
 */
const MediaGallery = (props) => {
    const [filename, set_filename] = useState('') //upload name
    const [loading, set_loading] = useState(false) //loading when uploading
    const [compress, set_compress] = useState(true) // should uploaded image be compressed

    const [records, set_records] = useState([])
    const [page, set_page] = useState(1)
    const [page_count, set_page_count] = useState(0)

    const [name, set_name] = useState('') // title form
    const [selected, set_selected] = useState(null) // selected image

    const [errors, set_errors] = useState({})

    useEffect(() => {
        getMediaGallery()
    }, [page])

    const onFileChange = (event) => {
        set_errors({})

        if (event.target.files.length > 0) {
            for (let i = 0; i < event.target.files.length; i++) {
                let value = event.target.files[i];
                let exceed = ExceedUploadLimit(value)
                if (exceed.value) {
                    let errors = {}
                    errors.filename = `Limit upload size is ${exceed.max_size / 1024} Kb`
                    set_errors(errors);
                    return;
                }
            }

            set_loading(true);
            const formData = new FormData();
            for (let i = 0; i < event.target.files.length; i++) {
                formData.append('files', event.target.files[i]);
            }
            formData.append('compress', compress);

            // console.log(formData)
            // return

            let url = process.env.REACT_APP_BASE_API_URL + 'media/uploadImage';

            axios.post(url, formData, Config({
                Authorization: 'Bearer ' + Cookie.get('token'),
                'content-type': 'multipart/form-data'
            })).then(response => {
                // set_filename(response.data.data)
                getMediaGallery()
            }).catch(error => {
                console.log(error)
                if (error.response) {
                    let errors = {}
                    errors.filename = error.response.data.message
                    set_errors(errors)
                }
            }).finally(() => {
                set_loading(false)
            });

        } else {
            set_filename('')
            set_loading(false)
        }
    }
    const setter = set => e => {
        set(e.target.value)
    }
    const onClose = () => {
        props.onClose()
    }
    const onUse = () => {
        let validate = true
        let errors = {}

        if (!selected) {
            validate = false
            errors.use = "Image selection is required"
        }
        if (!name) {
            validate = false
            errors.name = "Title is required"
        }
        set_errors(errors)
        if (!validate) return;

        props.onUse(selected, name)
    }
    const getMediaGallery = () => {
        let url = `${process.env.REACT_APP_BASE_API_URL}media/getMediaGallery`
        let params = {
            page: page,
            per_page: 25,
        }
        axios.get(url, Config({
            Authorization: 'Bearer ' + Cookie.get('token'),
        }, params)).then(res => {
            set_records(res.data.data.data)
            set_page_count(res.data.data.last_page)
        }).catch((error) => {
            console.log(error)
            if (error.response) console.log(error.response)
        })
    }
    const onPageChange = (page) => {
        set_page(page)
    }
    const selectImage = async (index) => {
        // let index = e.currentTarget.getAttribute('index')
        let selected = records[index]

        let url = await ImageGetPublicUrl(PublicStorageFolderPath.customer, selected.filename)
        selected.src = url
        set_selected(selected)
        set_name(selected.filename)
    }
    const copy = () => {
        navigator.clipboard.writeText(selected.src)
    }
    const deletePublicImage = () => {
        let url = `${process.env.REACT_APP_BASE_API_URL}media/deletePublicImage/${selected.id}`
        axios.delete(url, Config({
            Authorization: 'Bearer ' + Cookie.get('token'),
        })).then(res => {
            set_selected(null)
            getMediaGallery()
        }).catch((error) => {
            console.log(error)
            if (error.response) console.log(error.response)
        })
    }
    return (
        <div style={{ minHeight: "70vh", display: 'grid', gridTemplateColumns: '3fr 2fr' }}>
            <style>{`
                .img-sfh2l{
                    max-height: 100px;
                    max-width: 100%;
                    align-self: center;
                    justify-self: center;
                    overflow:hidden;
                }
                .img-sfh2l.active{
                    border: 2px solid #FFB200;
                }
            `}</style>
            <div className="p-3 bg-white">
                <h5 className="color-374650 font-weight-bold">All Media</h5>
                <div className="mt-3">
                    <div className="custom-file">
                        <input type="file" className="custom-file-input" id={"add-file"} onChange={onFileChange} accept="image/*" multiple />
                        <label className="custom-file-label" htmlFor="add-file">{filename}</label>
                    </div>
                    <Form.Check disabled='true' checked={compress} onChange={(e) => set_compress(e.target.checked)} type='checkbox' label="Compress" id="compress-media-gallery" />
                    {loading && <LoadingProgress />}
                    <ErrorDiv error={errors.filename} />
                </div>
                <div className="mt-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10 }}>
                    {records.map((item, index) => (
                        <CustomImage folder={PublicStorageFolderPath.customer} filename={item.filename} alt={item.filename} onClick={() => selectImage(index)} key={item.id} index={index} className={`img-sfh2l ${selected && selected.id === item.id ? "active" : ""} `} />
                    ))}
                </div>
                <div className="mt-2">
                    <Paginate pageCount={page_count} onPageChange={onPageChange} initialPage={page} />
                </div>
            </div>
            <div className="p-3 bgc-ECECEC">
                <div className="color-374650">Selected Image</div>
                {selected && <>
                    <div className="mt-2">
                        <img src={selected.src} alt={selected.filename} style={{ maxHeight: '200px', maxWidth: "100%" }} />
                    </div>
                    <div className="color-6D6D6D ">{selected.filename}</div>
                    <div className="color-6D6D6D ">
                        <span className="">{DateTimeFormat(selected.created_at, 0)}</span>
                    </div>
                    <div className="link mt-2 color-EB2424" onClick={deletePublicImage}>Delete Image</div>
                    <div>
                        <div className="form-group mt-2">
                            <label htmlFor="title" className="color-374650">Title</label>
                            <input type="text" className="form-control" name="name" required value={name} onChange={setter(set_name)} />
                            <ErrorDiv error={errors.name} />
                        </div>
                        <div className="form-group mt-2 ">
                            <label htmlFor="title" className="color-374650">File Url</label>
                            <input type="text" className="form-control" name="filename" required value={selected.src} disabled />
                            <div >
                                <span className="color-EC9700 link" onClick={copy}>Copy url to clipboard</span>
                            </div>
                        </div>
                    </div>
                </>}
                <ErrorDiv error={errors.use} />
                <div className="mt-3 d-flex">
                    <button type="button" className="btn bgc-EC9700 font-weight-bold text-white" onClick={onUse}>Use this image</button>
                    <button type="button" className="ml-2 btn border-6D6D6D font-weight-bold color-6D6D6D" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    )
}

export default MediaGallery