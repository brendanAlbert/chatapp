import { action } from 'easy-peasy';

export default {
  users: [],
  logged_in_users: [],
  users_to_receive_keys: [],
  symmetric_key: null,
  public_key: null,
  private_key: null,
  chat: [],
  user: null,
  socket: null,
  keysGenerated: false,

  addUser: action((state, payload) => {
    state.user = payload;
  }),
  setPublicKey: action((state, payload) => {
    state.public_key = payload;
  }),
  setPrivateKey: action((state, payload) => {
    state.private_key = payload;
  }),
  setSymmetricKey: action((state, payload) => {
    state.symmetric_key = payload;
  }),
  addUserToKeysList: action((state, payload) => {
    state.users_to_receive_keys.push(payload);
  }),
  removeUserFromKeysList: action((state, payload) => {
    state.users_to_receive_keys.pop(payload);
  }),
  keysGeneratedByServer: action((state, payload) => {
    state.keysGenerated = payload
  }),
  updateChat: action((state, payload) => {
    state.chat = payload;
  }),
  updateUsers: action((state, payload) => { 
    state.users = payload;
  }),
  updateLoggedInUsers: action((state, payload) => { 
    state.logged_in_users = payload;
  }),
  setSocket: action((state, payload) => {
    if(state.socket == null) state.socket = payload;
  })
}