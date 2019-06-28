const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const cryptico = require('cryptico');

// app.get('/', function(req,res) {
//   res.sendFile(__dirname + '/index.html');
// })

let users = [];
let logged_in_users = [];
let chat = [];
let active_socket = false;
let all_active_sockets = [];
let server_private_key;

function sendState (users, socket, logged_in_users) {

  let user_names = [];
  let loggedInUserNames = [];

  user_names = users.map( user_obj => user_obj.user_name );

  loggedInUserNames = logged_in_users.map( user_obj => user_obj.user_name );

  socket.emit('sending_server_state', {
    chat,
    user_names,
    loggedInUserNames
  })
}

const initialServerKeySetup = () => {
  const seed_to_generate_server_private_key = "seed_to_generate_server_private_key";
  const bits = 1024;
  server_private_key = cryptico.generateRSAKey(seed_to_generate_server_private_key, bits);

  const ssk = cryptico.publicKeyString(server_private_key);

  return ssk;
}

const serverSymmetricKey = initialServerKeySetup();

io.on('connection', function(socket) {

  all_active_sockets.push(socket);


  if(!active_socket) {
    active_socket = true;
    setInterval( () => {
      all_active_sockets.map( sckt => sendState(users, sckt, logged_in_users) )
    }, 3000);
  }

  console.log(`A user connected: ${socket.id}`);
  console.log(`all users: ${JSON.stringify(users)}`);
  console.log(`logged in users: ${JSON.stringify(logged_in_users)}`);

  socket.on('get_server_state', () => {
    //console.log('calling sendState();');
    sendState(users, socket, logged_in_users);
    
  })

  const doesUserExist = user_name => users.some( user_obj => user_obj.user_name === user_name ) 

  const addNewUser = user => users.push(user)

  const isAlreadyLoggedIn = user_name => logged_in_users.some( logged_in_user => logged_in_user.user_name === user_name )

  const emitAlreadyLoggedIn = socket => {
    socket.emit('authenticated', { auth: false });
  }

  const checkIfPasswordMatches = (username, password) => {
    // returns true immediately if finds a match, otherwise returns false
    return users.some( each_user => each_user.user_name === username && each_user.pass === password );
  }

  const emitPasswordMatches = socket => {
    emitAuthenticated(socket);
  }

  const emitPasswordDoesNotMatch = socket => {
    emitNotAuthenticated(socket);
  }

  const logInUser = (user_name, socket) => {
    logged_in_users.push({user_name: user_name, socket_id: socket.id});
  }

  const emitAuthenticated = socket => {
    socket.emit('authenticated', { auth: true });
  }

  const emitNotAuthenticated = socket => {
    socket.emit('authenticated', { auth: false });
  }

  // const assignUsersKeys = (user_obj, socket) => {
  //   let seed_to_generate_user_private_key = "seed_to_generate_user_private_key" + socket.id ;
  //   let bits = 1024;
  //   let private_key = cryptico.generateRSAKey(seed_to_generate_user_private_key, bits);
  //   let public_key = cryptico.publicKeyString(private_key);

  //   user_obj.public_key = public_key;
  //   user_obj.private_key = private_key;
  //   return user_obj
  // }


  socket.on('check_user', function(user_obj) {

    console.log(`receiving the emitted check_user user_obj => ${JSON.stringify(user_obj)}`)

    let {user_name, pass} = user_obj;
    let user_exists = false;

    user_exists = doesUserExist(user_name);

    if( !user_exists ) {
      // let keyed_user;
      // keyed_user = assignUsersKeys(user_obj, socket);
      addNewUser( user_obj );
      logInUser(user_name, socket);
      emitAuthenticated(socket);
    }

    console.log(`user exists status: ${user_exists}`)

    if( user_exists ) {
      // are they already logged in
      if(isAlreadyLoggedIn(user_name)) {
        console.log(`isAlreadyLoggedIn? = ${isAlreadyLoggedIn(user_name)}`)
        //  return already logged in
        emitAlreadyLoggedIn(socket);
      } else {
        if (checkIfPasswordMatches(user_name, pass) ) {
          emitPasswordMatches(socket);
          logInUser(user_name, socket);
        } else {
          emitPasswordDoesNotMatch(socket);
        }
      }
    }

    sendState(users, socket, logged_in_users);
  })

  socket.on('send_msg', function(data) {
    let encryptedMsg = data.msg;
    let { user } = data;
    let decrypted_message = cryptico.decrypt(encryptedMsg, server_private_key);
    console.log(`encrypted messaged received from user: ${encryptedMsg}`)
    chat.push({ user, msg: decrypted_message.plaintext});
    console.log(`chat: ${JSON.stringify(chat)}`);
    // socket.emit('update_chat', data);
    
    sendState(users, socket, logged_in_users);
    
  })

  // socket.on('msg', function(data) {
  //   io.sockets.emit('newmsg', data);
  // })
  socket.on('disconnect', function() {
    console.log(`A user disconnected, socket.id = ${socket.id}`);
    logged_in_users = logged_in_users.filter( user => user.socket_id !== socket.id );

    console.log(`All logged in users:  ${JSON.stringify(logged_in_users)}`);
    all_active_sockets.pop(socket);
    sendState(users, socket, logged_in_users);
  });

  socket.on('securely_get_symmetric_server_key', publicKey => {
    let encrypted_symmetric_key = cryptico.encrypt(serverSymmetricKey, publicKey);
    socket.emit('securely_sent_symmetricKey', encrypted_symmetric_key);
    console.log('just emiited symm key')
  })
  
})

const port = 3001;
http.listen(port, '0.0.0.0' ,function() {
  console.log(`listening on port: ${port}`);
})




/*


1. Secure Chat
In this project you are going to implement a
system which allows a group of users to 
chat securely. 

All users are registered with the chat server. 

When the user wants to chat with another
registered user, he first connects to the 
chat server and enters his/her user 
name and password. 

The server verifies the user name and password, 
and if correct, the user’s status is changed 
to “online“ and, the user may enter the users 
with whom he wishes to chat (could be more 
then one). 

At any time a user should be able to check 
what other users are online.

Once the user specifies the users with whom 
he wishes to chat, the server generates a 
symmetric key, and securely distributes it 
to all specified users (and the requesting user). 

To achieve secure key distribution you must 
encrypt the symmetric key using the 
public keys of the respective users (you may 
assume that server knows the public 
keys of all users). 
  
If one of the specified users is not online, 
the requesting user is notified about this.

After the encrypted symmetric has been 
distributed to all users, the users decrypt 
the symmetric key using their private keys, 
and the chat session may begin. 

All messages 
exchanged during the chat must be encrypted 
using the symmetric key provided by the server, 
and must be delivered to all users participating 
in the chat. Any user may choose to leave at 
any time without disrupting the session.

If the user disconnects from the chat server, 
his status should be changed to “offline“. 

All users who are connected to the server, 
must have a way to check whether a given user 
is online.

You do not need to support multiple 
chat sessions.

*/