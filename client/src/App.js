import "./App.css";
import logo from "./logo.svg";
import React, { useState, useEffect } from "react";
import * as dayjs from "dayjs";
import "dayjs/locale/es";
import { io } from "socket.io-client";
import ModalForm from "./components/ModalForm";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import UserList from "./components/UserList";
import MessageContainer from "./components/MessageContainer";
import InputMessage from "./components/InputMessage";

const socket = io(
  window.location.toString().includes("localhost")
    ? process.env.REACT_APP_API
    : process.env.REACT_APP_RENDER_API
);

function App() {
  //const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  dayjs.locale("es");
  const currentDateTime = dayjs().format();
  const initialState = [
    {
      id: 1,
      name: "Usuario Prueba",
      avatar: logo,
      messages: [
        {
          userId: 1,
          name: "Usuario Prueba",
          message: "Hola esto es una prueba",
          dateTime: currentDateTime,
        },
      ],
    },
    {
      id: 2,
      name: "Usuario sadasdas",
      avatar: logo,
      messages: [
        {
          userId: 2,
          name: "Usuario sadasdas",
          message: "aaaaaaaaaaaaaaaaaa",
          dateTime: currentDateTime,
        },
      ],
    },
  ];
  const [modalShow, setModalShow] = useState(true);
  const [userData, setUserData] = useState({});
  const [activeChat, setActiveChat] = useState(null);
  const [chats, setChat] = useState(initialState);

  useEffect(() => {
    socket.on("receive-subscribe", (userList) => {
      const userListFilter = Object.values(userList).reduce((acc, user) => {
        if (user.id !== socket.id) {
          acc.push(user);
        }
        return acc;
      }, []);
      setChat((chats) => [...chats, ...userListFilter]);
    });

    socket.on("receive-message", (msgObj) => {
      setChat((chats) =>
        chats.map((chat) => {
          if (chat.id === msgObj.userId) {
            return { ...chat, messages: [...chat.messages, msgObj] };
          }
          return chat;
        })
      );
    });

    return () => {
      socket.off("receive-subscribe");
      socket.off("receive-message");
    };
  }, []);

  function joinChat(user) {
    const thisUserData = { id: socket.id, avatar: logo, ...user };
    setUserData(thisUserData);
    socket.emit("send-subscribe", thisUserData);
    setModalShow(false);
  }

  function joinChannel(chatId) {
    setActiveChat(chatId);
  }

  function sendMessage(message) {
    const msgObj = {
      userId: userData.id,
      name: userData.name,
      message: message,
      dateTime: currentDateTime,
    };
    socket.emit("send-message", msgObj, activeChat);
    const updatedChat = chats.find((chat) => chat.id === activeChat);
    updatedChat.messages = [...updatedChat.messages, msgObj];
    setChat((chats) => [...chats]);
  }

  function sortChatsByLastMessage(chats) {
    return chats.sort((a, b) => {
      const aLastMessage =
        a.messages.length > 0 ? a.messages[a.messages.length - 1] : null;
      const bLastMessage =
        b.messages.length > 0 ? b.messages[b.messages.length - 1] : null;
      if (!aLastMessage || !bLastMessage) return null;
      return new Date(bLastMessage.dateTime) - new Date(aLastMessage.dateTime);
    });
  }

  const currentChat = chats.find((chat) => chat.id === activeChat);

  return (
    <div className="App">
      <header className="App-header">
        <ModalForm
          show={modalShow}
          onHide={() => setModalShow(false)}
          joinChat={joinChat}
        />
        {!modalShow ? (
          <Container className="chat-container">
            <Row>
              <Col className="chat-box user" xs>
                <UserList
                  currentChat={currentChat}
                  chats={sortChatsByLastMessage(chats)}
                  joinChannel={joinChannel}
                />
              </Col>
              <Col className="chat-box msg" xs lg="8">
                <MessageContainer
                  userData={userData}
                  currentChat={currentChat}
                />
                {currentChat ? (
                  <InputMessage sendMessage={sendMessage} />
                ) : null}
              </Col>
            </Row>
          </Container>
        ) : null}
      </header>
    </div>
  );
}

export default App;
