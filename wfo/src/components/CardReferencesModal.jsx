import React from "react";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import { useMutation, useLazyQuery, gql } from "@apollo/client";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
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

const REFERENCE_BY_URI_QUERY = gql`
   query getReferenceByUri($uri:    String!){
        getReferenceByUri(uri:  $uri){
            id,
            kind,
            linkUri,
            thumbnailUri,
            displayText
        }
    }
`;



function CardReferencesModal(props) {

    const [modalShow, setModalShow] = React.useState(false);
    const [refId, setRefId] = React.useState(null);
    const [refKind, setRefKind] = React.useState('');
    const [linkUri, setLinkUri] = React.useState('');
    const [displayText, setDisplayText] = React.useState('');
    const [comment, setComment] = React.useState('');
    const [urlValid, setUrlValid] = React.useState('false');
    const [duplicate, setDuplicate] = React.useState();


    const [updateReference, { loading: mLoading }] = useMutation(UPDATE_REFERENCE, {
        refetchQueries: ['getNameForWfoId']
    });

    const [getDuplicate, { loading: dupeLoading, data: dupeData }] = useLazyQuery(REFERENCE_BY_URI_QUERY, {
        fetchPolicy: "network-only" // we want to always run the search as the results might have changed 
    });

    // these are the kinds of reference we can handle here
    let kinds = ['literature', 'database', 'specimen', 'person']; // fixme this shouldn't really be hard coded
    
    // if we have duplicate data and either don't already have a duplicate or the duplicate we have 
    // is of another record
    if (dupeData && dupeData.getReferenceByUri && (!duplicate || duplicate.linkUri !== dupeData.getReferenceByUri.linkUri)) {

        setDuplicate(dupeData.getReferenceByUri);

        // the dupe may have a kind that we don't support in this context
        // in which case swap to prefered kind.
        // this allows us to move between treatments and taxon/name reference types.
        if (kinds.includes(dupeData.getReferenceByUri.kind)){
            setRefKind(dupeData.getReferenceByUri.kind);
        }else{
            setRefKind(props.preferredKind);
        }
        
        setLinkUri(dupeData.getReferenceByUri.linkUri);
        setDisplayText(dupeData.getReferenceByUri.displayText);
        setRefId(parseInt(dupeData.getReferenceByUri.id));

    }

    // if we have called but not found a duplicate
    if (dupeData && !dupeData.getReferenceByUri) {
        // imagine pasting in an exsiting uri, the data is loaded and refId set to the duplicate
        // the user then changes the URI! We need to reset the refId or we'll overwrite the originally
        // loaded duplicate.
        if (props.refUsage) {
            if (props.refUsage.reference.id !== refId) setRefId(parseInt(props.refUsage.reference.id));
        } else {
            if (refId) setRefId(null);
        }

        if (duplicate) setDuplicate(null);
    }

    function hide() {
        // the only way I can destroy the constant dupeData!!
        getDuplicate({ variables: { 'uri': 'banana' } });
        if (duplicate) setDuplicate(null);
        setModalShow(false);
    }

    function show() {
        if (props.refUsage) {
            if (props.refUsage.reference.displayText !== displayText) setDisplayText(props.refUsage.reference.displayText);
            if (props.refUsage.reference.linkUri !== linkUri) setLinkUri(props.refUsage.reference.linkUri);
            if (props.refUsage.reference.kind !== refKind) setRefKind(props.refUsage.reference.kind);
            if (props.refUsage.reference.id !== refId) setRefId(parseInt(props.refUsage.reference.id));
            if (props.refUsage.comment !== comment) setComment(props.refUsage.comment);
        } else {
            if (displayText !== "") setDisplayText("");
            if (linkUri !== "") setLinkUri("");
            if (refKind !== props.preferredKind) setRefKind(props.preferredKind); // default to preferred kind.
            if (refId) setRefId(null);
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

        getDuplicate({ variables: { 'uri': event.target.value } });

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
                    referenceId: refId
                }
            }
        );

        hide();
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
                    referenceId: refId
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
    permittedKindPicker = (
        <Form.Group controlId="reference_kind">
            <FloatingLabel label="Reference Type">
                <Form.Select name="referenceKind" value={refKind} onChange={kindSelectChanged} style={{ marginBottom: "1em" }} >
                    {kinds.map(kind => {
                        return (<option value={kind} key={kind} >{kind.charAt(0).toUpperCase() + kind.slice(1)}</option>)
                    })}
                </Form.Select>
            </FloatingLabel>
        </Form.Group >
    );

    // add a spinner for loading events
    let spinner = null;
    if (mLoading || dupeLoading) {
        spinner = <Spinner animation="border" role="status" variant="secondary">
            <span className="visually-hidden">Loading...</span>
        </Spinner>
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
                            {props.headerText}{refId ? " ~ Ref. #" + refId + ":" + refKind : null}
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
                                    <Form.Control type="text" disabled={false} value={linkUri} onChange={linkUriChanged} onBlur={linkUriChanged} placeholder="https://example.com/123" name="uri" />
                                </FloatingLabel>
                            </Form.Group>
                        </OverlayTrigger>
                        <OverlayTrigger
                            key="reference-display-text-overlay"
                            placement="top"
                            overlay={
                                <Tooltip id={`tooltip-reference-display-text`}>
                                    A full literature style citation, link text, person name etc.
                                    This is the human readable form of the URI link.
                                </Tooltip>
                            }
                        >
                            <Form.Group controlId="reference-display-text" style={{ marginTop: "1em" }}>
                                <FloatingLabel label="Display text">
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
                        {spinner}
                        <Button variant="danger" disabled={!refId} onClick={deleteRef}>Remove</Button>
                        <Button onClick={hide}>Cancel</Button>
                        <Button onClick={save} disabled={disableSaveButton()}>Save</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );


}
export default CardReferencesModal;