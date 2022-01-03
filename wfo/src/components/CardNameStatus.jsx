import React, { useState } from "react";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import { useMutation, useQuery, gql } from "@apollo/client";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import AlertUpdate from "./AlertUpdate";

const STATUS_QUERY = gql`
   query getNameStatus($wfo: String!){
        getNameForWfoId(id: $wfo){
            id,
            status,
            taxonPlacement{
                id,
                acceptedName{
                    id
                }
            }
        }
    }
`;

const UPDATE_STATUS = gql`
        mutation  updateNameStatus(
            $wfo: String!,
            $status: String!
            ){
          updateNameStatus(
              wfo: $wfo,
              status: $status
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

function CardNameStatus(props) {

    const [status, setStatus] = useState();
    const [wfo, setWfo] = useState();

    const { loading, data } = useQuery(STATUS_QUERY, {
        variables: { wfo: props.wfo }
    });

    const [updateNameStatus, { loading: mLoading, data: mData }] = useMutation(UPDATE_STATUS, {
        refetchQueries: [
            STATUS_QUERY, // run this query again
            'getNameStatus' // Query name
        ],
    });

    let name = data ? data.getNameForWfoId : null;

    // if the wfo has changed then update our default state
    if (name && wfo !== props.wfo) {
        setWfo(props.wfo);
        setStatus(name.status);
    }

    function handleSubmit(event) {
        event.preventDefault();
        updateNameStatus(
            {
                variables: {
                    wfo: props.wfo,
                    status: status
                }
            }
        );
    }

    function handleStatusChange(event) {
        event.preventDefault();
        setStatus(event.target.value);
    }

    function renderStates() {

        const statuses = [
            'conserved',
            'deprecated',
            'illegitimate',
            'invalid',
            'rejected',
            'sanctioned',
            'superfluous',
            'unknown',
            'valid'
        ];

        let disabled = false;
        let isAccepted = false;
        if (name && name.taxonPlacement && name.taxonPlacement.acceptedName.id === name.id) isAccepted = true;

        let help = "The nomenclatural status of the name affects where it can be placed in the taxonomy.";
        if (isAccepted) help = "Accepted names of taxa can only be valid, conserved or sanctioned";

        return (
            <OverlayTrigger
                key="status-overlay"
                placement="top"
                overlay={
                    <Tooltip id={`tooltip-status`}>
                        {help}
                    </Tooltip>
                }
            >
                <Form.Group controlId="status">
                    <Form.Select name="status" disabled={false} value={status} onChange={handleStatusChange}>
                        {
                            statuses.map(s => {

                                disabled = false;

                                // if we are a taxon then we can only be certain status
                                if (isAccepted) {
                                    disabled = true;
                                    if (s === 'valid') disabled = false;
                                    if (s === 'sanctioned') disabled = false;
                                    if (s === 'conserved') disabled = false;
                                }

                                return (<option disabled={disabled} value={s} key={s} >{s}</option>);

                            })
                        }
                    </Form.Select>
                </Form.Group>
            </OverlayTrigger>
        );


    }

    function renderButton() {

        // nothing to save don't render at all
        if (name && name.status === status) return null;

        // should we be disabled
        let disabled = false;
        let spinner = null;

        if (loading) {
            disabled = true;
            spinner = <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
            />
        }

        return (
            <Form.Group controlId="submit-button" style={{ textAlign: "right", marginTop: "1em" }}>
                <Button disabled={disabled} variant="primary" type="submit" onClick={handleSubmit}>
                    Update
                    {" "}
                    {spinner}
                </Button>
            </Form.Group>

        );


    }

    return (
        <Form onSubmit={handleSubmit}>
            <Card bg="secondary" text="white" style={{ marginBottom: "1em" }}>
                <Card.Header>Nomenclatural Status</Card.Header>
                <Card.Body style={{ backgroundColor: "white", color: "gray" }} >
                    {renderStates()}
                    <AlertUpdate response={mData ? mData.updateNameStatus : null} loading={mLoading} wfo={props.wfo} />
                    {renderButton()}
                </Card.Body>
            </Card>
        </Form>
    );

}
export default CardNameStatus;
