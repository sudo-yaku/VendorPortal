import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux'
import * as actions from '../actions';
import Loader from '../../Layout/components/Loader'
import moment from 'moment'
import broken_image from '../../Images/broken_image.png';
import FilePreview from "../../VWRSSearch/FilePreview";
import crossIcon from '../../Images/CancelIcon.svg'
import Dropzone from 'react-dropzone'
import ListOfImages from '../../sites/components/ListOfImages'
import imageCompression from "browser-image-compression";

function RMAPictures(props) {
    const dispatch = useDispatch();
    const rmaPicturesLoading = useSelector(state => { return state.getIn(["VendorDashboard", props.loginId, props.rma.IOP_RMA_ID, "rmaPicturesLoading"]) });
    const attachments = useSelector(state => { return state.getIn(["VendorDashboard", props.loginId, props.rma.IOP_RMA_ID, "rmaPicturesData"]) });
    const rmaPictureError = useSelector(state => { return state.getIn(["VendorDashboard", props.loginId, props.rma.IOP_RMA_ID, "rmaPictures", "errors"]) }) || null

    useEffect(() => {
        dispatch(actions.getRmaPictures(props.loginId, "rma", props.rma.IOP_RMA_ID, true))
    }, [])


    const [imagesList, setImagesList] = useState([])
    const [viewImage, setViewImage] = useState(null);
    const [rmaPicturePrevError, setPicturePrevError] = useState(null);
    const [rmaPicturePrevLoading, setPicturePrevLoading] = useState(false);

    const [imageName, setImageName] = useState(null);
    const [imageTimeStamp, setimagetiemStamp] = useState(null);
    const [filesData, setfilesData] = useState([])
    const [messageTimer, setMessageTimer] = useState(false)
    const [rmaerror, setRmaError] = useState("")
    const [rmaMessage, setRmaMessage] = useState("")
    const [isUploadLoading, setUploadLoading] = useState(null)

    useEffect(() => {
        const dates = attachments?.toJS()?.map(attachment => attachment?.uploadedOn);
        //sorting attachments based on time stamps
        attachments?.sort((a, b) => new Date(b.uploadedOn) - new Date(a.uploadedOn));
        //sort the dates logic
        const uniqueDates = [...new Set(dates?.map(dates => dates.split("T")[0]))];
        uniqueDates?.sort((a, b) => new Date(b) - new Date(a));
        const attachmentsData = attachments?.toJS()?.map(attachment => {
            return { ...attachment, uploadedOn: attachment?.uploadedOn?.split("T")[0], uploadedTime: attachment?.uploadedOn }
        })
        let dataSet = {};
        uniqueDates?.forEach(uniquedate => {
            let result = attachmentsData?.filter(attachment => attachment?.uploadedOn == uniquedate);
            dataSet[uniquedate] = result;
        })
        setImagesList(dataSet);

    }, [attachments])

    const setFilePreviewData = (categoryID, attachmentId, imageName, uploadedTime) => {
        setImageName(imageName)
        setimagetiemStamp(uploadedTime)
        setPicturePrevLoading(true)
        dispatch(actions.getRmaPicturesPrev(props.loginId, categoryID, attachmentId)).then(res => {
            setPicturePrevLoading(false)
            if (res.type === "RMA_PICTURES_PREV_FAILURE") {
                setPicturePrevError(res.errors);
                setViewImage(null)
            } else {
                setViewImage(res?.data);
                setPicturePrevError(null);
            }
        }).catch(err => {
            setPicturePrevLoading(false)
            setPicturePrevError("Error fetching image preview")
        })
    }

    const onAttachRemove = (index) => {
        setfilesData(filesData.filter((_, i) => i !== index))
        setUploadLoading(null)
    }

    const uploadRMA = () => {
        let att = filesData.map(e => {
            return {
                "image": e.file_data,
                "name": e.file_name
            }
        })
        const input = {
            "siteUnid": props.site_unid,
            "attachmentId": props.rma.IOP_RMA_ID ? props.rma.IOP_RMA_ID : props.workorderId,
            "category": props.rma ? "rma" : "vwrs",
            "uploadedBy": props.loginId,
            "vendorId": props.vendorId,
            "attachments": att
        }
        setUploadLoading(true)
        dispatch(actions.uploadRMAImages(props.loginId, props.workorderId, input)).then(res => {
            setMessageTimer(true)
            if (res?.type == "UPLOAD_RMA_DETAILS_SUCCESS") {
                setRmaMessage(res?.result)
                if (res?.result == "Something went wrong") {
                    setRmaError(true)
                }
                setUploadLoading(false);
                dispatch(actions.getRmaPictures(props.loginId, "rma", props.rma.IOP_RMA_ID, true));
                setfilesData([])
                setTimeout(() => {
                    setMessageTimer(false)
                }, 10000)
            } else {
                setRmaError(false)
                setUploadLoading(false)
                setTimeout(() => {
                    setMessageTimer(false)
                }, 10000)
            }
        })
    }
    const onFileDrop = (files) => {
        files.forEach(file => {
            const fileType = file.name.split('.')[1];
            let droppedFile = {
                file_name: file['name'],
                file_data: file,
                status: 'Processing',
                validationColor: 'black'
            }
            setfilesData(filesData.concat(droppedFile))
            if (file['size'] > 0) {
                if (parseInt(file.size / 1024 / 1024) > 20) {
                    let droppedFile = {
                        file_name: file['name'],
                        file_data: file,
                        status: 'File size limit exceeded of 20 MB',
                        validationColor: 'red'
                    }
                    setfilesData(filesData.concat(droppedFile))
                    setRmaError(true)
                } else if (!(fileType === 'JPG' || fileType === 'jpg' || fileType === 'JPEG' || fileType === 'jpeg' || fileType === 'png' || fileType === 'PNG' || fileType === 'img' || fileType === 'IMG')) {
                    let droppedFile = {
                        file_name: file['name'],
                        file_data: file,
                        status: 'Please upload images',
                        validationColor: 'red'
                    }
                    setfilesData(filesData.concat(droppedFile))
                    setRmaError(true)
                } else {
                    imageCompression(file, {
                        maxSizeMB: 20,
                        maxWidthOrHeight: 10000,
                        useWebWorker: false,
                    }).then(async (compressedFile) => {
                        let imageURI = await readFileAsBase64(compressedFile)
                        imageURI = imageURI.toString().split('data:' + file['type'] + ';base64,')[1];
                        let droppedFile = {
                            file_name: file['name'],
                            file_data: imageURI,
                            status: 'Processed',
                            validationColor: 'black'
                        }
                        setfilesData(filesData.concat(droppedFile))
                    })
                }
            }
        })
    }
    const disable20mb = () => {
        let count = 0;
        filesData.forEach(e => {
            if (['Processing', 'File size limit exceeded of 20 MB', 'Please upload images'].includes(e.status)) {
                count = 1;
            }
        })
        if (count == 1) {
            return true;
        } else {
            return false;
        }
    }
    const readFileAsBase64 = async (file) => {
        return new Promise((resolve, reject) => {
            const reader = new window.FileReader();
            reader.onload = () => {
                resolve(reader.result);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };
    return (<>
        <div style={{ padding: '2%', borderBottom: '2px solid lightgrey' }}>
            <span>Attachments</span>
            {(rmaPicturesLoading || rmaPicturePrevLoading || isUploadLoading) &&
                <Loader color="#cd040b"
                    size="50px"
                    margin="4px"
                    className="text-center" />
            }
            {imagesList && Object.keys(imagesList).length > 0 ? Object.keys(imagesList).map((date, index) => {
                return (
                    <>
                        <div style={{ paddingLeft: "2rem", fontWeight: '500' }}><b>{moment(date).format('MMM DD,YYYY')}</b></div>
                        <div style={{ display: 'flex', flexWrap: "wrap", gap: "1rem", paddingTop: "1rem", boxSizing: "border-box" }}>

                            {imagesList[date].map(image => {
                                return (
                                    <>
                                        <div style={{ display: 'flex', flex: "0 0 30%", padding: '0.5em', marginBottom: '1em', border: '1px solid lightgray', maxWidth: '30%', boxSizing: "border-box" }}>
                                            <div style={{ flex: '0.5 1 2%' }} />
                                            <div style={{ flex: '1 1 10%' }}>
                                                <img src={broken_image} width={'30px'} style={{ marginTop: "0.3rem" }} />
                                            </div>
                                            <div style={{ flex: '2 1 70%' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <div style={{ wordWrap: 'break-word' }}>{image?.name}</div>
                                                    <div><span><i>{moment(image.uploadedTime).format('hh:mm A')}</i></span></div>
                                                </div>
                                            </div>
                                            <div style={{ flex: '1 1 0%' }}>
                                                <a onClick={() => setFilePreviewData(image.categoryId, image.id, image.name, image.uploadedTime)}>
                                                    <i
                                                        className='pointer fa fa-eye'
                                                        title="View Attachment"
                                                        style={{ color: '#337AB7', cursor: "pointer" }}
                                                    /></a>
                                            </div>
                                        </div>

                                    </>
                                )
                            })}

                        </div>
                        {viewImage && imageTimeStamp.split("T")[0] === date && (
                            <>
                                <div>{imageName}</div>
                                <div style={{ padding: 10 }}><span><i>{moment(imageTimeStamp).format('MMM DD,YYYY')} {moment(imageTimeStamp).format('hh:mm A')}</i></span>
                                    <a onClick={() => {
                                        setViewImage(null);
                                        setImageName(null);
                                        setimagetiemStamp(null)
                                    }}>
                                        <img style={{ float: 'right', cursor: "pointer" }} width="16px" height="16px" src={crossIcon} />
                                    </a></div>
                                <div
                                    style={{
                                        border: '1px solid black',
                                        padding: 10,
                                        height: '70vh',
                                        overflowY: 'auto',
                                        msOverflowY: 'auto',
                                        maxWidth: '80vw',
                                    }}
                                >
                                    <FilePreview base64String={viewImage} mimeType='image' />
                                </div>
                            </>
                        )}
                        {rmaPicturePrevError && imageTimeStamp.split("T")[0] === date && <div className="text-danger">{rmaPicturePrevError}</div>}
                    </>)
            }
            ) : !rmaPictureError ? <div>No attachments found</div> : null}
            {rmaPictureError && <div className="text-danger">{rmaPictureError}</div>}
            <div style={{ padding: '2%' }} className="container row">
                <div className="col-md-5">
                    <div style={{ fontWeight: 'bold', fontSize: '12px', paddingBottom: '2%' }}>Upload Attachments</div>
                    <Dropzone onDrop={onFileDrop}>
                        {({ getRootProps, getInputProps }) => (
                            <section style={{ width: '100%', minHeight: '85px', border: '2px dashed rgb(102, 102, 102)', borderRadius: '5px', textAlign: 'center' }}>
                                <div {...getRootProps()}>
                                    <input {...getInputProps()} />
                                    <p style={{ paddingTop: "30px" }}>Drag 'n' drop some files here, or click to select files</p>
                                </div>
                            </section>
                        )}
                    </Dropzone>
                </div>

                <div className="col-md-3">
                    <button
                        type="button"
                        className="Button--medium"
                        onClick={(e) => uploadRMA()}
                        disabled={(disable20mb() || isUploadLoading == true || filesData.length == 0) ? true : false}
                        style={{ width: 'fit-content', float: "right", padding: "8px 15px", marginTop: "4em", fontSize: "1rem" }}
                    >Upload</button>
                </div>
            </div>
            {rmaMessage.length > 0 && messageTimer &&
                <div className="col-md-10" style={{ padding: '0px' }}>
                    <div className="text-center" style={{ color: rmaerror ? 'red' : 'green', fontWeight: 'bold' }}>{rmaMessage}</div>
                </div>}
            <div style={{ padding: '2%' }} className="container row">
                <div className="col-md-5">
                    <ListOfImages onRemoveClick={onAttachRemove} fileList={filesData} />
                </div>
            </div>
        </div></>)
}
export default RMAPictures