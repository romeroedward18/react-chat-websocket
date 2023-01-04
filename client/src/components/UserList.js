import React, { Suspense } from "react";
import "../App.css";
import * as dayjs from "dayjs";

export default function UserList({ joinChannel, currentChat, chats }) {
  const currentChatId = currentChat ? currentChat.id : "";
  return (
    <>
      {chats.map((chat, key) => {
        return (
          <Suspense key={key}>
            <div
              className={`chat-user-container ${
                chat.id === currentChatId ? "active" : ""
              }`}
              onClick={() => joinChannel(chat.id)}
            >
              <div>
                <img src={chat.avatar} alt="Avatar" className="user-avatar" />
              </div>
              <div className="user-info">
                <div>{chat.name}</div>
                <div>
                  {chat.messages.length > 0
                    ? dayjs(chat.messages.at(-1).dateTime).format(
                        "DD/MM/YYYY h:mm A"
                      )
                    : ""}
                </div>
              </div>
            </div>
          </Suspense>
        );
      })}
    </>
  );
}
