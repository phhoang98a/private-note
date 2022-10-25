import React, { useState, useEffect } from 'react';
import { Layout, Affix, Button } from 'antd';
import SignUp from './signUp';
import Login from './login';
import Note from './note';
import Guidance from './guidance';
import logo from "../image/logo.png"

const { Header, Content, Footer } = Layout;
const Main = () =>{

	const [openLogin, setOpenLogin] = useState(false);
  const [openSignUp, setOpenSignUp] = useState(false);
	const [username, setUsername] = useState("");
  const [isLogin, setIsLogin] = useState(false);

	return (
		<>
		<Layout style={{ height: "100vh" }}>
			<Affix offsetTop={0} className="app__affix-header">
				<Header style={{ display: 'flex', backgroundColor: "rgb(199, 70, 70)" }}>
          <div style={{ display: 'block', marginLeft: 'auto', marginRight: 'auto' }}>
            <img alt="cam" src={logo} style={{width: "270px"}}></img>
          </div>
          {
            isLogin ? 
            <>
              <div style={{color: "#ffece4",position: 'absolute', right: 0, marginRight: "190px", fontSize: "18px", fontWeight: "bold"}}>Hello, {username}</div>
              <div style={{ position: 'absolute', right: 0, marginRight: '90px' }}>
                <Button style={{ borderRadius: '5px', backgroundColor: "#ffece4", color: "rgb(199, 70, 70)", fontWeight: "bold" }} type="primary" 
                    onClick={() => { setIsLogin(false); } }>Sign Out</Button>
              </div>
            </>
            :           
            <>
              <div style={{ position: 'absolute', right: 0, marginRight: '190px' }}>
                <Button style={{ borderRadius: '5px', backgroundColor: "#ffece4", color: "rgb(199, 70, 70)", fontWeight: "bold" }} type="primary" onClick={() => { setOpenLogin(true); } }>Sign In</Button>
              </div>
              <div style={{ position: 'absolute', right: 0, marginRight: '30px', color: "#ffece4" }}>
                New user?
                <Button type="link" style={{ marginLeft: "-10px", color: "#0438B0" }} onClick={() => { setOpenSignUp(true); } }>
                  Start here
                </Button>
              </div>
            </> 
          }
				</Header>
			</Affix>
      <Content className="site-layout" style={{ backgroundColor: "rgb(199, 70, 70)", padding: '0 50px' }}>
        {
          isLogin ? <Note username = {username} isLogin={isLogin} /> :
          <Guidance/>
        }
      </Content>
      <Footer style={{backgroundColor: "rgb(199, 70, 70)"}}>
      </Footer>
		</Layout>
		{(openLogin) &&<Login
			open={openLogin}
			setOpen={setOpenLogin}
      username = {username}
      setUsername={setUsername}
      setIsLogin={setIsLogin}
		/>}
    {(openSignUp) && <SignUp
			open={openSignUp}
			setOpen={setOpenSignUp}
      username = {username}
      setUsername={setUsername}
    />}
		</>
	)
}

export default Main;