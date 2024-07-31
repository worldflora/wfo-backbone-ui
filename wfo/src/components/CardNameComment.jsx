import React, { useState } from "react";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import { useMutation, useQuery, gql } from "@apollo/client";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import AlertUpdate from "./AlertUpdate";


const COMMENT_QUERY = gql`
   query getNameComment($wfo: String!){
        getNameForWfoId(id: $wfo){
            id,
            canEdit,
            comment
        }
    }
`;

const UPDATE_COMMENT = gql`
        mutation  updateComment(
            $wfo: String!,
            $comment: String!
            ){
          updateComment(
              wfo: $wfo,
              comment: $comment
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

function CardNameComment(props) {

    const [comment, setComment] = useState('');
    const [wfo, setWfo] = useState('');

    const { loading, data } = useQuery(COMMENT_QUERY, {
        variables: { wfo: props.wfo }
    });

    const [updateComment, { loading: mLoading, data: mData }] = useMutation(UPDATE_COMMENT, {
        refetchQueries: [
            COMMENT_QUERY, // run this query again
            'getComment'
        ],
    });

    let name = data ? data.getNameForWfoId : null;



    // if the wfo has changed then update our default state
    if (name && wfo !== props.wfo) {
        setWfo(props.wfo);
        setComment(name.comment === null ? '' : name.comment);
    }

    function handleSubmit(event) {
        event.preventDefault();
        updateComment(
            {
                variables: {
                    wfo: props.wfo,
                    comment: comment
                }
            }
        );
    }

    function handleCommentChange(event) {
        event.preventDefault();
        setComment(event.target.value);
    }

    function renderButton() {

        if (name) {
            if (name.comment === comment) return null;
            if (name.comment === null && comment === "") return null;
        }

        // should we be disabled
        let spinner = null;

        if (loading) {
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
                <Button variant="primary" type="submit" onClick={handleSubmit}>
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

                <Card.Header>

                    <OverlayTrigger
                        key="status-overlay"
                        placement="top"
                        overlay={
                            <Tooltip id={`tooltip-status`}>
                                Remarks that might help a future researcher understand the information presented here and save them some work.
                            </Tooltip>
                        }
                    >
                        <span>Comments</span>
                    </OverlayTrigger>
                        
                </Card.Header>

                <Card.Body style={{ backgroundColor: "white", color: "gray" }} >
                        <Form.Group controlId="authors">
                            <Form.Control type="text" as="textarea" disabled={name && name.canEdit ? false : true} placeholder="Comments" name="comment" value={comment} onChange={handleCommentChange} />
                        </Form.Group>
                    <AlertUpdate response={mData ? mData.updateComment : null} loading={mLoading} wfo={props.wfo} />
                    {renderButton()}
                </Card.Body>
            </Card>
        </Form>

    );

}
export default CardNameComment;
