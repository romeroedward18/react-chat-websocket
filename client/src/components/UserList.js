import React, { memo } from "react";
import "../App.css";
import * as dayjs from "dayjs";

const UserList = memo(({ onSetActiveChat, currentChat, chats, userData }) => {
  const currentChatId = currentChat ? currentChat.id : "";
  console.log(chats)
  return (
    <>
      {chats.map((chat, key) => {
        let lastMessage = "";
        let lastMessageDateTime = "";
        for (const msg of chat.messages) {
          lastMessage =
            msg.userId === userData.id ? `Tú: ${msg.message}` : msg.message;
          lastMessageDateTime = dayjs(lastMessage.dateTime).format("h:mm A");
        }
        return (
          <React.Fragment key={key}>
            <div
              className={`chat-user-container ${
                chat.id === currentChatId ? "active" : ""
              } ${chat.status}`}
              onClick={() => onSetActiveChat(chat.id)}
            >
              <div>
                <img src={chat.avatar} alt="Avatar" className="user-avatar" />
              </div>
              <div className="user-info">
                <div>{chat.name}</div>
                <div className="last-msg">{lastMessage}</div>
              </div>
              <div className="user-msg-info">
                <div>{lastMessageDateTime}</div>
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </>
  );
});

export default UserList;
