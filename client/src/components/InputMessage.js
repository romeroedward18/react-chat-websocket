import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import "../App.css";

export default function InputMessage({ sendMessage }) {
  const [message, setMessage] = useState("");

  function handleInputChange(event) {
    setMessage(event.target.value);
  }

  function handleSubmit(event) {
    event.preventDefault();
    sendMessage(message);
    setMessage("");
  }

  return (
    <div>
      <div className="input-message-container">
        <Form className="form-input-message" onSubmit={handleSubmit}>
          <Form.Control
            className="input-message"
            type="text"
            placeholder=""
            autoFocus
            name="message"
            value={message}
            onChange={handleInputChange}
            required
          />
          <Button className="send-btn" type="submit">
            Enviar
          </Button>
        </Form>
      </div>
    </div>
  );
}
