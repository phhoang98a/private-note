import React, { useEffect, useState } from 'react';
import { Button, Modal, Input, notification, Image, Tooltip } from 'antd';
import PropTypes from "prop-types";
import { CloseOutlined, CameraOutlined } from '@ant-design/icons';
import Webcam from "react-webcam";

const Login = ({open, setOpen, username, setUsername, setIsLogin}) =>{

  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const openNotificationWithIcon = (type,notificationText) => {
    notification[type]({
      description: notificationText,
    });
  };

  const videoConstraints = {
    facingMode: "user"
  };

  useEffect(()=>{
    if (open===true){
        setImages([]);
        setUsername("");
        setIsLoading(false);
    }
  }, [open, setUsername])

  const Login = async () =>{
    if (username===""){
      openNotificationWithIcon('warning','Please put in an username');
    }else if (images.length===0){
      openNotificationWithIcon('warning','Please take one picture of yourself');
    }else{
      setIsLoading(true)
      const data = await fetch('https://lit-river-50496.herokuapp.com/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json','Accept': 'application/json'},
        body: JSON.stringify({
          username: username,
          image: images
        }),
      });
      const response = await data.json();
      if (response.status===200){
        openNotificationWithIcon('success',response.msg);
        setOpen(false)
        setIsLogin(true)
      }else{
        openNotificationWithIcon('warning',response.msg);
      }
      setIsLoading(false)
    }
  }

  const Delete = async(e,index)=>{
    const newImages = [...images];
    newImages.splice(index,1);
    setImages(newImages);
  }

  return (
    <Modal open={open} width="700px" onCancel={()=>{setOpen(false)}} 
      footer={
        [
          <Button key="submit" type="primary" onClick={Login} loading={isLoading}
            style={{borderRadius: "5px",backgroundColor: "#ffece4", color: "rgb(199, 70, 70)", fontWeight: "bold", display: 'block', marginLeft: 'auto', marginRight: 'auto'}}
          >
            Login
          </Button>,
        ]
      }>
			<Input placeholder="Username" value={username} style={{marginBottom:"20px", width: "98%"}} onChange={(e)=>setUsername(e.target.value)}/>
      <p style={{color: "rgb(199, 70, 70)", fontWeight: "bold"}}>Please take a  portrait of your face for authentication.</p>
      <div style={{position: "relative"}}>
        <Webcam
            audio={false}
            height="100%"
            screenshotFormat="image/jpeg"
            width="100%"
            videoConstraints={videoConstraints}
          >
             {({ getScreenshot }) => (
                <Tooltip title='Capture'>        
                  <CameraOutlined 
                    style={{position: "absolute", zIndex: 10000, bottom: "10px", right: "45%", fontSize: "50px", color: "white"}}
                    onClick={() => {
                      const dataUri = getScreenshot();
                      setImages([dataUri]);
                    }}/>
                </Tooltip>
             )}
        </Webcam>
      </div>
      <div style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}>
        {images.map((image, index) => (
          <div key={index} style={{ width: "150px", paddingRight: "12px", position: "relative" }}>
            <CloseOutlined onClick={event =>Delete(event, index)} style={{ fontSize: '16px', position: "absolute", zIndex: 10000, top: "2px", right: "12px", color: "white" }} />
            <Image alt="cam" src={image} style={{ width: "100%" }}/>
          </div>
        ))}
      </div>
    </Modal>
  )
}

Login.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  username: PropTypes.string.isRequired,
  setUsername: PropTypes.func.isRequired,
  setIsLogin: PropTypes.func.isRequired,
};


export default Login;