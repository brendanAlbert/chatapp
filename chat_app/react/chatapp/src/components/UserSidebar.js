import React, { Fragment, useState, useEffect } from 'react'
import { useStoreState, useStoreActions } from 'easy-peasy';

import './usersidebar.css';

import User from './User';

const cryptico = require('cryptico');

const UserSidebar = () => {
  const users = useStoreState( state => state.users );
  const logged_in_users = useStoreState( state => state.logged_in_users );
  const logged_in = useStoreState( state => state.user );
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [not_authenticated, setAuth] = useState(false);
  const [enough_users, isEnoughUsers] = useState(true);
  const addUser = useStoreActions( actions => actions.addUser );
  const socket = useStoreState( state => state.socket );
  const keysGenerated = useStoreState( state => state.keysGenerated );
  const keysGeneratedByServer = useStoreActions( actions => actions.keysGeneratedByServer );
  const addUserToKeysList = useStoreActions( actions => actions.addUserToKeysList );
  const usersToReceiveKeys = useStoreState( state => state.users_to_receive_keys );
  const setPublicKey = useStoreActions( actions => actions.setPublicKey );
  const setPrivateKey = useStoreActions( actions => actions.setPrivateKey );
  const setSymmetricKey = useStoreActions( actions => actions.setSymmetricKey );
  const [symm_key_set, setSymmKeyTrue] = useState(false);

  const publicKey = useStoreState( state => state.public_key);
  const privateKey = useStoreState( state => state.private_key);
  const symmetricKey = useStoreState( state => state.symmetric_key );

  useEffect(() => {

  }, [symmetricKey, addUser, usersToReceiveKeys, symm_key_set])


  const assignUserKeys = (user, pass) => {
    let seed_to_generate_user_private_key = "seed_to_generate_user_private_key" + user + pass ;
    let bits = 1024;
    let private_key = cryptico.generateRSAKey(seed_to_generate_user_private_key, bits);
    let public_key = cryptico.publicKeyString(private_key);
    setPublicKey(public_key);
    setPrivateKey(private_key);
  }

  const checkAuthenticationFromServer = () => {
    if (user === '') return;
    let user_obj = {user_name: user, pass};
    socket.emit('check_user', user_obj);
    console.log(`user_obj => ${JSON.stringify(user_obj)}`)
    socket.on('authenticated', data => {
      let { auth } = data;

      if(auth) {

        addUser(user);
        if(usersToReceiveKeys.indexOf(user) === -1) {
          addUserToKeysList(user);
        }
        assignUserKeys(user, pass);
        setAuth(false);

      } else {

        setAuth(true);

      }
    })
  }

  const generateKeys = () => {

    
    
    // socket.on('keys_generated', users_with_keys => {
      
    // })

    if(usersToReceiveKeys.indexOf(user) === -1) {
      addUserToKeysList(user);
    }

    if (usersToReceiveKeys.length > 1) {
      isEnoughUsers(true)

      socket.emit('securely_get_symmetric_server_key', publicKey);
      socket.on('securely_sent_symmetricKey', encrypted_symmetric_key => {
        let decrypted_symmetric_key = cryptico.decrypt(encrypted_symmetric_key.cipher, privateKey);
        setSymmetricKey(decrypted_symmetric_key.plaintext);
        console.log(`setting symmetric key to ${decrypted_symmetric_key.plaintext}`);
        setSymmKeyTrue(true);
      })
      keysGeneratedByServer(true);

    } else {
      isEnoughUsers(false);
    }
    
  }

  return (
    <div>
      <div className="sidebar">
      <div className="users">{`Users [${users.length}]`}</div>
      <div>Online [{logged_in_users.length}]</div>
        <div className="online-user-container">
          { logged_in_users.map( (name, index) => <User user={user} index={index} name={name}/> ) }
        </div>

      <div>Offline [{users.length - logged_in_users.length}]</div>
      <div className="offline-user-container">
        { users.map( (each_user, index) => {
            return ( logged_in_users.indexOf(each_user) === -1 ? 
              <p key={index}>{each_user}</p> :
              null
          )
        } ) }
      </div>

      { !logged_in && (
           <Fragment>
            
              { not_authenticated && ( <div className="failed_login_msg">username or password mismatch</div> ) }
              <input 
                value={user}
                placeholder="enter username"
                className="user_name_input"
                type="text" onChange={ event => setUser(event.target.value) } />
              <input 
                value={pass}
                placeholder="enter password"
                className="password_input"
                type="password" onChange={ event => setPass(event.target.value) } />   
              <button
                onClick={ () => checkAuthenticationFromServer() }
                        
              className="add_user_btn">Sign In</button>
         </Fragment>
        ) }

        { logged_in && !keysGenerated && (
          <Fragment>
            <div className="sidebar_container left">How to send secure encrypted chat:<br/>1. Click on logged in users names you wish to chat with. A green key next to their name means they will securely receive a public and private key pair from the server with which to encrypt/decrypt messages.<br/>2. Then click 'Generate Keys'</div>
            { !enough_users && (
              <Fragment><div className="failed_login_msg">{"Can't send keys to just yourself!"}</div></Fragment>
            )}
            <button className="generate_key_btn" onClick={ () => generateKeys() }>Generate Keys</button>
          </Fragment>
        )}

      </div>
    </div>
  )

}
  
export default UserSidebar
