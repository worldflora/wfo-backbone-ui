import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import { useMutation, useQuery, gql } from "@apollo/client";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import AlertUpdate from "./AlertUpdate";
import FloatingLabel from "react-bootstrap/FloatingLabel";

const UPDATE_REFERENCE = gql`
        mutation  updateReference(
            $kind:          String!
            $linkUri:       String!
            $displayText:   String!
            $comment:       String!
            $subjectType:   String!
            $wfo:           String!
            $referenceId:   Int
            ){
          updateReference(
                kind:           $kind,
                linkUri:        $linkUri,
                displayText:    $displayText,
                comment:        $comment,
                subjectType:    $subjectType,
                wfo:            $wfo,
                referenceId:    $referenceId
          ){
            name,
            success,
            message,
            children{
              name,
              success,
              message
            }
          }
        }
`;


function CardReferencesModal(props) {

    const [modalShow, setModalShow] = React.useState(false);
    const [refKind, setRefKind] = React.useState('');
    const [linkUri, setLinkUri] = React.useState('');
    const [displayText, setDisplayText] = React.useState('');
    const [comment, setComment] = React.useState('');
    const [urlValid, setUrlValid] = React.useState('false');

    const [updateReference, { loading: mLoading, data: mData, error: mError }] = useMutation(UPDATE_REFERENCE, {
        refetchQueries: ['getNameForWfoId']
    });

    function hide() {
        setModalShow(false);
    }

    function show() {
        if (props.refUsage) {
            if (props.refUsage.reference.displayText !== displayText) setDisplayText(props.refUsage.reference.displayText);
            if (props.refUsage.reference.linkUri !== linkUri) setLinkUri(props.refUsage.reference.linkUri);
            if (props.refUsage.reference.kind !== refKind) setRefKind(props.refUsage.reference.kind);
            if (props.refUsage.comment !== comment) setComment(props.refUsage.comment);
        } else {
            if (displayText !== "") setDisplayText("");
            if (linkUri !== "") setLinkUri("");
            if (refKind !== "") setRefKind("");
            if (comment !== "") setComment("");
        }
        setModalShow(true)
    }

    function disableSaveButton() {

        // can't save malformed url
        if (!isValidHttpUrl(linkUri)) return true;

        // we must have display text
        if (!displayText) return true;

        // a value must have changed
        if (
            props.refUsage
            &&
            props.refUsage.reference.displayText === displayText
            &&
            props.refUsage.reference.linkUri === linkUri
            &&
            props.refUsage.reference.kind === refKind
            &&
            props.refUsage.comment === comment

        ) {
            return true;
        }

        return false;

    }

    function linkUriChanged(event) {

        setLinkUri(event.target.value);

        // change the urlValid state only if it has changed.
        if (isValidHttpUrl(linkUri) !== urlValid) setUrlValid(!urlValid);

    }

    function displayTextChanged(event) {
        setDisplayText(event.target.value);
    }


    function commentChanged(event) {
        setComment(event.target.value);
    }

    function save() {

        updateReference(
            {
                variables: {
                    kind: refKind,
                    linkUri: linkUri,
                    displayText: displayText,
                    comment: comment,
                    subjectType: props.linkTo,
                    wfo: props.wfo,
                    referenceId: getReferenceId()
                }
            }
        );

        hide();
    }

    function getReferenceId() {
        // do we have an existing ref?
        let referenceId = null;
        if (props.refUsage && props.refUsage.reference) {
            referenceId = parseInt(props.refUsage.reference.id);
        }
        return referenceId;
    }

    function deleteRef() {
        updateReference(
            {
                variables: {
                    kind: 'DELETE',
                    linkUri: linkUri,
                    displayText: displayText,
                    comment: comment,
                    subjectType: props.linkTo,
                    wfo: props.wfo,
                    referenceId: getReferenceId()
                }
            }
        );
        hide();
    }

    function isValidHttpUrl(string) {
        let url;

        try {
            url = new URL(string);
        } catch (e) {
            return false;
        }

        return url.protocol === "http:" || url.protocol === "https:";
    }

    function kindSelectChanged(e) {
        console.log("new kind: " + e.target.value);
        setRefKind(e.target.value);
    }

    // set up the kind of reference
    let permittedKindPicker = null;

    if (props.permittedKinds.length === 1) {
        // if we only have one permitted kind
        if (refKind !== props.permittedKinds[0]) setRefKind(props.permittedKinds[0]);
    } else {
        // we have multiple kinds to pick between
        if (!refKind) setRefKind(props.permittedKinds[0]); // default to first kind
        permittedKindPicker = (
            <Form.Group controlId="reference_kind">
                <FloatingLabel label="Reference Type">
                    <Form.Select name="referenceKind" value={refKind} onChange={kindSelectChanged} style={{ marginBottom: "1em" }} >
                        {props.permittedKinds.map(kind => {
                            return (<option value={kind} key={kind} >{kind.charAt(0).toUpperCase() + kind.slice(1)}</option>)
                        })}
                    </Form.Select>
                </FloatingLabel>
            </Form.Group >
        );
    }

    return (
        <>
            <Button variant="outline-secondary" onClick={show} style={{ float: "right", whiteSpace: "nowrap" }}>
                {props.refUsage ? "Edit" : props.addButtonText}
            </Button>
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
                            {props.headerText}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>
                            {props.bodyText}
                        </p>

                        {permittedKindPicker}


                        <OverlayTrigger
                            key="reference-uri-overlay"
                            placement="top"
                            overlay={
                                <Tooltip id={`tooltip-reference-uri`}>
                                    An HTTP(s) web address of the reference including DOIs with their https://doi.org/ prefixes.
                                    This is unique in the database.
                                </Tooltip>
                            }
                        >
                            <Form.Group controlId="reference-uri" style={{ marginTop: "1em" }}>
                                <FloatingLabel label="URI web link.">
                                    <Form.Control type="text" disabled={false} value={linkUri} onChange={linkUriChanged} onInput={linkUriChanged} onBlur={linkUriChanged} placeholder="https://example.com/123" name="uri" style={{ color: urlValid ? 'black' : 'red' }} />
                                </FloatingLabel>
                            </Form.Group>
                        </OverlayTrigger>

                        <OverlayTrigger
                            key="reference-display-text-overlay"
                            placement="top"
                            overlay={
                                <Tooltip id={`tooltip-reference-display-text`}>
                                    Either a full literature style citation or link text.
                                    This is the human readable form of the URI link.
                                </Tooltip>
                            }
                        >
                            <Form.Group controlId="reference-display-text" style={{ marginTop: "1em" }}>
                                <FloatingLabel label="Citation or link text.">
                                    <Form.Control type="text" disabled={false} placeholder="Citation/link text" name="display-text" value={displayText} onChange={displayTextChanged} />
                                </FloatingLabel>
                            </Form.Group>
                        </OverlayTrigger>


                        <OverlayTrigger
                            key="status-overlay"
                            placement="top"
                            overlay={
                                <Tooltip id={`tooltip-status`}>
                                    A comment on the relationship between the reference identified by the URI and this {props.linkTo}.
                                </Tooltip>
                            }
                        >
                            <Form.Group controlId="authors" style={{ marginTop: "1em" }}>
                                <Form.Control type="text" as="textarea" placeholder="Comment" name="comment" value={comment} onChange={commentChanged} />
                            </Form.Group>

                        </OverlayTrigger>

                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="danger" disabled={!getReferenceId()} onClick={deleteRef}>Delete</Button>
                        <Button onClick={hide}>Cancel</Button>
                        <Button onClick={save} disabled={disableSaveButton()}>Save</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );


}
export default CardReferencesModal;