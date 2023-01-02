import React, { Suspense } from "react";
import "../App.css";

export default function MessageContainer({ type, dateTime, avatar, message }) {
  return (
    <Suspense>
      <div>
        <p className="dataTime-text">{dateTime}</p>
        <div className={`message-container ${type}`}>
          {type === "receive" ? (
            <div>
              <img src={avatar} alt="Avatar" className="user-avatar" />
            </div>
          ) : null}
          <div className={`message ${type}`}>
            <div>{message}</div>
          </div>
        </div>
      </div>
    </Suspense>
  );
}
