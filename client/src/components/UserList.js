import React, { Suspense } from "react";
import "../App.css";

export default function UserList({ onClick, avatar, name, dateTime, active }) {
  return (
    <Suspense>
      <div
        className={`chat-user-container ${active ? "active" : ""}`}
        onClick={onClick}
      >
        <div>
          <img src={avatar} alt="Avatar" className="user-avatar" />
        </div>
        <div className="user-info">
          <div>{name}</div>
          <div>{dateTime}</div>
        </div>
      </div>
    </Suspense>
  );
}
