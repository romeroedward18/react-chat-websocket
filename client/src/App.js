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
  process.env.REACT_APP_API_RENDER
    ? process.env.REACT_APP_API_RENDER
    : process.env.REACT_APP_API
);

function App() {
  //const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  dayjs.locale("es");
  const currentDateTime = dayjs().format();
  const initialState = [
    {
      id: 1,
      name: "Usuario Prueba",
      messages: [
        {
          userId: 1,
          name: "Usuario Prueba",
          message: "Hola esto es una prueba",
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
      const userListFilter = userList.filter((user) => user.id !== socket.id);
      userListFilter.forEach((user) => {
        setChat((chats) => {
          const chatsId = chats.map((chat) => chat.id);
          if (!chatsId.includes(user.id)) {
            return [...chats, user];
          }
          return chats;
        });
      });
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
    const thisUserData = { id: socket.id, ...user };
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
    setChat((chats) =>
      chats.map((chat) => {
        if (chat.id === activeChat) {
          return { ...chat, messages: [...chat.messages, msgObj] };
        }
        return chat;
      })
    );
  }

  chats.sort(function (a, b) {
    return a.messages.length > 0 && b.messages.length > 0
      ? new Date(b.messages.at(-1).dateTime) -
          new Date(a.messages.at(-1).dateTime)
      : null;
  });

  const currentChat = chats.find((chat) => chat.id === activeChat);
  let arrMessages = [];

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
                {chats.map((chat, key) => {
                  return (
                    <UserList
                      key={key}
                      onClick={() => joinChannel(chat.id)}
                      avatar={logo}
                      name={chat.name}
                      dateTime={
                        chat.messages.length > 0
                          ? dayjs(chat.messages.at(-1).dateTime).format(
                              "DD/MM/YYYY h:mm A"
                            )
                          : ""
                      }
                      active={chat.id === activeChat}
                    />
                  );
                })}
              </Col>
              <Col className="chat-box msg" xs lg="8">
                <div className="messages-container">
                  {currentChat
                    ? currentChat.messages.map((msg, key, arr) => {
                        const type =
                          msg.userId === userData.id ? "send" : "receive";
                        const dateTime =
                          arrMessages.length > 0 &&
                          dayjs(arrMessages.at(-1).dateTime).format(
                            "MMMM D, YYYY h:mm A"
                          ) ===
                            dayjs(msg.dateTimedayjs).format(
                              "MMMM D, YYYY h:mm A"
                            )
                            ? ""
                            : dayjs(msg.dateTime).format("MMMM D, YYYY h:mm A");
                        if (arr.length - 1 === key) {
                          arrMessages = [];
                        } else {
                          arrMessages.push(msg);
                        }
                        return (
                          <MessageContainer
                            key={key}
                            type={type}
                            dateTime={dateTime}
                            avatar={logo}
                            message={msg.message}
                          />
                        );
                      })
                    : null}
                </div>
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
