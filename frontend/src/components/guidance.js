import React from 'react';
import { Image } from 'antd';
import workImage from "../image/work.svg"

const Guidance = () =>{
  return (
  	<>
			<div style={{ marginTop: "70px" }}>
				<Image src={workImage} preview={false} width="400px"/>
				<p style={{color: "#ffece4", marginTop: "40px", textAlign: "center", fontWeight: "bold", fontSize: "25px"}}>
					When such vital information is required, users frequently save it on paper or in computer files. However, it is very easy to lose information, and users frequently forget where they saved it. Users can use the Private Note app to store important information. 
					In order to prevent password forgetting or preventing others from logging in with the password, users will use facial recognition to log in.
				</p>
			</div>
  	</>
  )
}

export default Guidance;