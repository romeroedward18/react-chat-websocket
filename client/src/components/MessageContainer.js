import React, { useRef, useEffect, Suspense } from "react";
import "../App.css";
import * as dayjs from "dayjs";

export default function MessageContainer({ userData, currentChat }) {
  const messagesEndRef = useRef(null);
  const currentChaMessages = currentChat ? currentChat.messages : null;
  let arrMessages = [];

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    scrollToBottom();
  }, [currentChaMessages]);

  return (
    <div className="messages-container">
      {currentChat
        ? currentChat.messages.map((msg, key, arr) => {
            const type = msg.userId === userData.id ? "send" : "receive";
            const dateTime =
              arrMessages.length > 0 &&
              dayjs(arrMessages.at(-1).dateTime).format(
                "MMMM D, YYYY h:mm A"
              ) === dayjs(msg.dateTimedayjs).format("MMMM D, YYYY h:mm A")
                ? ""
                : dayjs(msg.dateTime).format("MMMM D, YYYY h:mm A");
            if (arr.length - 1 === key) {
              arrMessages = [];
            } else {
              arrMessages.push(msg);
            }
            return (
              <Suspense key={key}>
                <p className="dataTime-text">{dateTime}</p>
                <div className={`message-container ${type}`}>
                  {type === "receive" ? (
                    <div>
                      <img
                        src={currentChat.avatar}
                        alt="Avatar"
                        className="user-avatar"
                      />
                    </div>
                  ) : null}
                  <div className={`message ${type}`}>
                    <div>{msg.message}</div>
                  </div>
                </div>
              </Suspense>
            );
          })
        : null}
      <div ref={messagesEndRef} />
    </div>
  );
}
