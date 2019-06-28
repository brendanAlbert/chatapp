import React , { useEffect, useState } from 'react';

import UserSidebar from '../components/UserSidebar';
import ChatWindow from '../components/ChatWindow';
import io from 'socket.io-client';

import { useStoreActions } from 'easy-peasy';
import '../App.css';

const socket = io("http://192.168.0.12:3001");
// const socket = io("http://10.67.11.226:3001");


const ChatApp = () => {

  const [active_socket, setActive] = useState(false);
  const setSocket = useStoreActions( actions => actions.setSocket );
  setSocket(socket);
  
  if(!active_socket) {
    setActive(true);
    setInterval( () => {
      console.log('emitting get_server_state');
      socket.emit('get_server_state');
    }, 3000);
  }
  
  const updateUsers = useStoreActions( actions => actions.updateUsers );
  const updateLoggedInUsers = useStoreActions( actions => actions.updateLoggedInUsers );
  const updateChat = useStoreActions( actions => actions.updateChat );
  
  useEffect(() => {
    
    socket.on('sending_server_state', state => {
      console.log(`${JSON.stringify(state)}`);
      updateUsers(state.user_names);
      updateLoggedInUsers(state.loggedInUserNames);
      updateChat(state.chat);
    })
  })
  

  return (
    <div className="App">
      <UserSidebar />
      <ChatWindow />
    </div>
  )

}


export default ChatApp
