import React from "react";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";
/*
import Spinner from "react-bootstrap/Spinner";
import { useMutation, useLazyQuery, gql } from "@apollo/client";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import FloatingLabel from "react-bootstrap/FloatingLabel";
*/


function CardSynonymsModal(props) {

    const [modalShow, setModalShow] = React.useState(false);
    let spinner = null;

    function hide() {
        setModalShow(false);
    }

    function show() {
        setModalShow(true)
    }

    function save() {
        hide();
    }

    const badgeStyle = {
        fontSize: "80%",
        verticalAlign: "super",
        cursor: "pointer"
    };

    if(!props.synonyms) return null;

    return (
        <>
            <span style={badgeStyle} >{' '}
                <Badge pill bg="secondary" onClick={(show)}>{props.synonyms.length.toLocaleString()}</Badge>
            </span>
            <Modal
                show={modalShow}
                onHide={hide}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Form noValidate={true}>
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-vcenter">
                            Synonyms
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>
                            this is the form
                        </p>
                    </Modal.Body>
                    <Modal.Footer>
                        {spinner}
                        <Button onClick={hide}>Cancel</Button>
                        <Button onClick={save} disabled={false}>Save</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );


}
export default CardSynonymsModal;