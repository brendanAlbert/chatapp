import React from 'react';
import { StoreProvider, createStore } from 'easy-peasy';
import model from './model';
import ChatApp from './components/ChatApp';
const store = createStore(model);

const App = () => {
    return (
      <StoreProvider store={store}>
        <ChatApp />
      </StoreProvider>
    );
}

export default App;
