import React, { useState } from "react";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import ListGroup from "react-bootstrap/ListGroup";
import { useQuery, gql } from "@apollo/client";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

const BASIONYMS_QUERY = gql`
        query getPossibleBasionyms($wfo: String! $filter: String!){
            getPossibleBasionyms(id: $wfo filter: $filter){
                name{
                    id,
                    wfo,
                    fullNameString
                }
                possibleBasionyms{
                    id,
                    wfo,
                    fullNameString,
                    year
                }
            }
        }
`;

function CardNameTypeRelationshipsPick(props) {

    const [filter, setFilter] = useState('');
    const [wfo, setWfo] = useState('');

    // loading the picking data
    const { loading, data, refetch } = useQuery(BASIONYMS_QUERY, {
        variables: { wfo: props.wfo, filter: filter }
    });

    // if the wfo has changed then update our default state
    if (wfo !== props.wfo) {
        setWfo(props.wfo);
        setFilter('');
        //setComment(name.comment === null ? '' : name.comment);
    }

    function handleFilterChange(e) {
        e.preventDefault();

        setFilter(e.target.value);

        // we wait a second after they stop typing
        let typingTimer = null;
        clearTimeout(typingTimer);
        typingTimer = setTimeout(() => {
            refetch({
                wfo: wfo,
                filter: e.target.value
            })
        }, 1000);

    }

    function handleItemSelect(basionym) {

        // run mutation
        props.updateBasionym({
            variables: {
                wfo: props.wfo,
                basionymWfo: basionym.wfo
            }
        });

    }

    let possibleNamesList = null;

    if (!loading && data && data.getPossibleBasionyms) {

        possibleNamesList =

            <ListGroup variant="flush" style={{ maxHeight: "30em", overflow: "auto" }} >
                {
                    data.getPossibleBasionyms.possibleBasionyms.map((b, i) => {
                        let year = b.year ? <span>[{b.year}]</span> : null;
                        return <ListGroup.Item
                            key={i}
                            action
                            onClick={(e) => { e.preventDefault(); handleItemSelect(b); }}>
                            <span dangerouslySetInnerHTML={{ __html: b.fullNameString }} />
                            {" "}{year}
                        </ListGroup.Item>
                    })
                }
            </ListGroup>

    }


    return (
        <>
            <Card.Body style={{ backgroundColor: "white", color: "black" }} >
                <Form>
                    <OverlayTrigger
                        key="status-overlay"
                        placement="top"
                        overlay={
                            <Tooltip id={`tooltip-status`}>
                                Filter possible basionyms. Only species and below with appropriate year are displayed.
                            </Tooltip>
                        }
                    >
                        <Form.Group controlId="filterBox">
                            <Form.Control type="text" placeholder="Type for alphabetical search" autoFocus={true} name="filterBox" value={filter} onChange={handleFilterChange} />
                        </Form.Group>
                    </OverlayTrigger>
                </Form>
            </Card.Body>
            {possibleNamesList}
        </>

    );

}
export default CardNameTypeRelationshipsPick;