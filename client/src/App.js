import "./App.css";
import logo from "./logo.svg";
import NotificationSound from "./notification-sound.mp3";
import React, { useRef, useState, useEffect } from "react";
import * as dayjs from "dayjs";
import "dayjs/locale/es";
import { io } from "socket.io-client";
import ModalForm from "./components/ModalForm";
import Spinner from "react-bootstrap/Spinner";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import UserList from "./components/UserList";
import MessageContainer from "./components/MessageContainer";
import InputMessage from "./components/InputMessage";

// Establecer la conexión con Socket.io
const socket = io(process.env.REACT_APP_API);

function App() {
  //const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  // Obtenemos la fecha y hora actual
  dayjs.locale("es");
  const currentDateTime = dayjs().format();
  // Se establece el estado inicial de la aplicación con un solo usuario y un mensaje
  const initialState = [
    {
      id: 1,
      name: "Usuario Prueba",
      avatar: logo,
      status: "unseen",
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
  // Se inicializa una referencia de audio y los estados de la aplicación
  const audioPlayer = useRef(null);
  const [connected, setConnected] = useState(false);
  const [modalShow, setModalShow] = useState(true);
  const [userData, setUserData] = useState({});
  const [activeChat, setActiveChat] = useState(null);
  const [chats, setChat] = useState(initialState);

  // Función para reproducir el archivo de audio
  function playAudio() {
    audioPlayer.current.play();
  }

  useEffect(() => {
    socket.on("connect", () => {
      setConnected(true);
      // Cuando se recibe un mensaje de "receive-subscribe", actualiza la lista de usuarios
      socket.on("receive-subscribe", (userList) => {
        // Filtramos la lista de usuarios para excluir al usuario actual
        const userListFilter = Object.values(userList).reduce((acc, user) => {
          if (user.id !== socket.id) {
            acc.push(user);
          }
          return acc;
        }, []);
        // Actualizamos el estado de la aplicación con la lista de usuarios filtrada
        setChat((chats) => {
          let updatedChats = [...chats];
          // Añadimos cada usuario a la lista de chats si no está ya en ella
          userListFilter.forEach((user) => {
            if (!updatedChats.find((chat) => chat.id === user.id)) {
              updatedChats.push(user);
            }
          });
          // Filtramos la lista de chats para excluir a cualquier usuario que ya no esté en la lista de usuarios
          updatedChats = updatedChats.filter((chat) => userList[chat.id]);
          // Mantenemos el usuario de pruebas en la lista de chats
          const chat1 = chats.find((chat) => chat.id === 1);
          if (chat1 && !updatedChats.find((chat) => chat.id === 1)) {
            updatedChats.push(chat1);
          }
          return updatedChats;
        });
      });

      // Cuando se recibe un mensaje de "receive-message", se actualiza el chat activo y reproducimos un sonido de notificación
      socket.on("receive-message", (msgObj) => {
        setChat((chats) =>
          chats.map((chat) => {
            if (chat.id !== activeChat) {
              chat.status = "unseen";
              playAudio();
            }
            // Si el id del chat coincide con el id del usuario que envió el mensaje, actualizamos el objeto con el nuevo mensaje
            if (chat.id === msgObj.userId) {
              return { ...chat, messages: [...chat.messages, msgObj] };
            }
            return chat;
          })
        );
      });
    });

    // Desconectamos los handlers cuando se desmonta el componente
    return () => {
      socket.off("connect");
    };
  }, [activeChat]);

  // Esta función se llama cuando se envía el formulario de inicio de sesión y se utiliza para unirse al chat
  function joinChat(user) {
    // Creamos un objeto con los datos del usuario actual
    const thisUserData = { id: socket.id, avatar: logo, ...user };
    setUserData(thisUserData);
    // Establece el estado de la aplicación con los datos del usuario actual y envía un mensaje al servidor para subscribirse al chat
    socket.emit("send-subscribe", thisUserData);
    setModalShow(false);
  }

  function joinChannel(chatId) {
    setActiveChat(chatId);
    setChat((chats) =>
      chats.map((chat) => {
        if (chat.id === chatId) {
          return { ...chat, status: "seen" };
        }
        return chat;
      })
    );
  }

  // Esta función se llama cuando se envía un mensaje y se utiliza para enviar un mensaje al servidor y actualiza el estado de la aplicación
  function sendMessage(message) {
    // Creamos un objeto con los datos del mensaje
    const msgObj = {
      userId: userData.id,
      name: userData.name,
      message: message,
      dateTime: currentDateTime,
    };
    // Envía el mensaje al servidor y actualiza el chat activo con el mensaje enviado
    socket.emit("send-message", msgObj, activeChat);
    const updatedChat = chats.find((chat) => chat.id === activeChat);
    updatedChat.messages = [...updatedChat.messages, msgObj];
    setChat((chats) => [...chats]);
  }

  // Esta función nos permite ordenar los chats por la fecha y hora del último mensaje
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

  console.log(chats);

  return (
    <div className="App">
      <header className="App-header">
        {connected ? (
          <>
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
                      userData={userData}
                    />
                  </Col>
                  <Col className="chat-box msg" xs lg="8">
                    <MessageContainer
                      userData={userData}
                      currentChat={currentChat}
                      chats={chats}
                    />
                    {currentChat ? (
                      <InputMessage sendMessage={sendMessage} />
                    ) : null}
                  </Col>
                </Row>
                <audio ref={audioPlayer} src={NotificationSound} />
              </Container>
            ) : null}
          </>
        ) : (
          <div className="spinner-container">
            <Spinner className="spinner-icon" variant="light"></Spinner>
            <span>Cargando...</span>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
