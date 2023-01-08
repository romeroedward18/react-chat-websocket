import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";

function ModalForm({ joinChat, ...props }) {
  const [joinForm, setJoinForm] = useState({
    name: "",
  });

  function handleInputChange(event) {
    setJoinForm({
      ...joinForm,
      [event.target.name]: event.target.value,
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    joinChat(joinForm);
  }

  return (
    <Modal
      {...props}
      size="lg"
      backdrop="static"
      keyboard={false}
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header>
        <Modal.Title id="contained-modal-title-vcenter">
          Ingresa tus datos
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              placeholder=""
              autoFocus
              value={joinForm.name}
              onChange={handleInputChange}
              name="name"
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button type="submit">Continuar</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default ModalForm;
