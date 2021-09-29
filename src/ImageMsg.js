import React, { useState, useEffect } from "react";


const ImageMsg = ({ message, ...rest }) => {
    let [imageSrc, setImageSrc] = useState("");

    let blob = new Blob([message.body], { type: message.type });
    useEffect(() => {
        console.log(message);

        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = function () {
            setImageSrc(reader.result);
        }
    }, [message.body]);
    return (
        <img style={{ width: 150, height: "auto" }} src={imageSrc} alt="" />
    )
}

export default ImageMsg;
