import * as React from "react";
import { Modal, ModalBody, ModalHeader } from "reactstrap";

import "./App.scss";
export interface HelloWorldProps {
  userName: string;
  lang: string;
}

export function HelloWorld() {
  return (
    <>
      <h1>Hi from React! Welcome to!</h1>
      <Modal isOpen>
        <ModalHeader>Modal title</ModalHeader>
        <ModalBody>Modal body text goes here.</ModalBody>
      </Modal>
    </>
  );
}
