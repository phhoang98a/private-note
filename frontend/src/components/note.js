import React, { useEffect, useState } from 'react';
import { Card, Input, Button, Col, Row, notification } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

const { TextArea } = Input;

const Note = ({username, isLogin}) =>{

  const [note, setNote] = useState("");
  const [listNote, setListNote] = useState([]);
  const openNotificationWithIcon = (type,notificationText) => {
    notification[type]({
      description: notificationText,
    });
  };

  const getNote = async ()=>{
    const url = new URL('https://lit-river-50496.herokuapp.com/notes');
    url.search = new URLSearchParams({username: username}); 
    const data = await fetch(url.toString(), {
      method: 'GET',
      headers: {'Content-Type': 'application/json','Accept': 'application/json'},
    });
    const content = await data.json();
    return content.notes
  };

  const addNote = async ()=>{
    if (note===""){
      openNotificationWithIcon('warning',"Please complete the note's information.");
    }else{
      const data = await fetch('https://lit-river-50496.herokuapp.com/notes', {
        method: 'POST',
        headers: {'Content-Type': 'application/json','Accept': 'application/json'},
        body: JSON.stringify({
          username: username,
          note: note
        }),
      });
      const content = await data.json();
      setListNote(content.notes.reverse());
      setNote("");
      openNotificationWithIcon('success', content.msg);
    }
  }

  const Delete = async(e,index)=>{
    let notes = [...listNote];
    notes = notes.reverse()
    notes.splice(index,1);
    await fetch('https://lit-river-50496.herokuapp.com/newnotes', {
      method: 'POST',
      headers: {'Content-Type': 'application/json','Accept': 'application/json'},
      body: JSON.stringify({
        username: username,
        note: notes
      }),
    });
    openNotificationWithIcon('success', 'Delete note successfully');
    setListNote(notes.reverse());
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() =>{
    const loadData = async () => {
      const  notes = await getNote();
      setListNote(notes.reverse())
    };
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Row gutter={16} style={{marginTop: "70px"}}>
        <Card title="Take your note here" bordered={true} span={8} style={{ display: "block", marginLeft: "auto", marginRight: "auto", width: "50%", height: "40%" }}>
          <TextArea placeholder="Note" value={note} onChange={(e) => setNote(e.target.value)} rows={3} maxLength={1000} showCount={true}
            style={{ display: "block", marginLeft: "auto", marginRight: "auto" }} />
          <Button key="submit" type="primary" onClick={addNote}
            style={{
              borderRadius: "5px", backgroundColor: "#ffece4", color: "rgb(199, 70, 70)", fontWeight: "bold",
              display: 'block', marginLeft: 'auto', marginRight: 'auto', marginTop: "10px"
            }}
          >
            Add Note
          </Button>
        </Card>
        <Card title="Your notes" bordered={true} span={8} style={{ display: "block",
          marginLeft: "auto", marginRight: "auto", width: "40%", height: "500px", overflowY: "auto" }}>
          {
            listNote.length===0
            ?
              <div style={{color: "rgb(199, 70, 70)", marginTop: "15px", textAlign: "center"}}>Nothing to show. Use "Add a Note" section above to add notes</div>
            :
            <div className="site-card-wrapper">
              <Row gutter={16}>
                {listNote.map((note, index) => (
                  <Col key={listNote.length-index} span={6} style={{marginTop: "10px"}}>
                    <Card title={"Note "+String(listNote.length-index)} bordered={false} style={{backgroundColor: "#ffece4"}}>
                      {note}
                    </Card>
                    <CloseOutlined onClick={event =>Delete(event, listNote.length-index-1)} style={{ fontSize: '16px', position: "absolute", zIndex: 10000, top: "2px", right: "12px", color: "#cf433b" }} />
                  </Col>
                ))}
              </Row>
            </div>
          }
        </Card>
      </Row>
    </>
  )
}

export default Note;