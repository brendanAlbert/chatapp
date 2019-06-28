import React, { useState, useEffect } from 'react'
import { useStoreActions, useStoreState } from 'easy-peasy';

const User = ({index, name, user}) => {

  const [clicked, toggleClick] = useState(false);
  const [classState, setClassState] = useState("user");
  const addUserToKeysList = useStoreActions( actions => actions.addUserToKeysList );
  const removeUserFromKeysList = useStoreActions( actions => actions.removeUserFromKeysList );
  const listOfUsersReceivingKeys = useStoreState( state => state.users_to_receive_keys );
  const keysGenerated = useStoreState( state => state.keysGenerated );

  const userClicked = name => {

    determineClassList();

    if(keysGenerated) return;
    
    toggleClick(!clicked);

    if(listOfUsersReceivingKeys.indexOf(name) === -1) {
      addUserToKeysList(name);
    } else {
      removeUserFromKeysList(name);
    }


  }

  useEffect( () => {
    determineClassList();
  })

  const determineClassList = () => {
    let new_state = 'user';
    if (user === name) new_state = "user selected no_cursor";
    else if( clicked && keysGenerated ) new_state = "user selected no_cursor";
    else if( !clicked && keysGenerated ) new_state = "no_cursor";
    else if( !keysGenerated && clicked ) new_state = "user selected";
    else if( !keysGenerated && !clicked) new_state = "user";

    // return new_state;
    setClassState(new_state);
  }

// user === name ? setClassState("user selected no_cursor") : clicked ? setClassState("user selected") : setClassState("user")
  return (
        <p 
          onClick={ () => userClicked(name) }
          className={ classState } 
          key={index}>{user === name ? '[logged in as] ' + name : name}<i className="key fas fa-key"></i>
        </p>
  )
}

export default User
