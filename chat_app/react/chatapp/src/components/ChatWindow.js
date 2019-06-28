import React, { Fragment, useState } from 'react';
import './chatwindow.css';
import { useStoreState } from 'easy-peasy';

const cryptico = require ('cryptico');

const ChatWindow = () => {

  const chat_history = useStoreState( state => state.chat);
  const user = useStoreState( state => state.user);
  const [msg, setMsg] = useState("");
  // const addMessage = useStoreActions( actions => actions.addMsg);
  const socket= useStoreState( state => state.socket);
  const keysGenerated = useStoreState( state => state.keysGenerated );
  const symmetric_key = useStoreState( state => state.symmetric_key);
  // socket.on('generate_keys', () => keysGenerated = )

  // const fireMsg = () => {
  //   socket.emit('send_msg', {user: user, msg: msg});
  //   setMsg('');
  // }

  const encryptMessage = msg => {
    let encrypted_message = cryptico.encrypt(msg, symmetric_key)
    socket.emit('send_msg', {user: user, msg: encrypted_message.cipher});
    setMsg('');
  }
  
  return (
    <div className="chatwindow">
      <div id="title"><i id="lock_icon" className="fas fa-user-lock"></i>{"Secure Chat App"}</div>
        <div className="chat">
          {
            chat_history.map( msg => {
                  return <p className={ msg.user === user ? 'self': 'other'} key={msg.msg+msg.user}>{msg.user} said: {msg.msg}</p>
            })
          }
        </div>
          { user && keysGenerated && ( 
            <Fragment>
              <input 
              className="msg_input"
              value={msg} 
              onKeyPress={ (event) => {
                if(event.key === 'Enter') {
                  // socket.emit('send_msg', {user: user, msg: msg});
                  // setMsg('');
                  encryptMessage(msg);
                }
              }}
              onChange={ event => { setMsg(event.target.value)} } type="text"/>
              <button
              className="msg_button"
              onClick={ () => encryptMessage(msg) }>Send Encrypted Message<i id="send_lock_icon" className="fas fa-lock"></i></button>
            </Fragment>
          
            )
          }
    </div>
  )
  
  
}

export default ChatWindow;