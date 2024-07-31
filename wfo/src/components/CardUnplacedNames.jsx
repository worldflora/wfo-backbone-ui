import React from "react";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import Spinner from "react-bootstrap/Spinner";
import { useQuery, gql } from "@apollo/client";
import ListGroupItem from "react-bootstrap/ListGroupItem";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Badge from "react-bootstrap/Badge";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

const UNPLACED_NAMES_QUERY = gql`
  query getUnplacedNames($wfo: String! $offset: Int){
        getUnplacedNames(id: $wfo offset: $offset){
            offset
            limit
            totalUnplacedNames
            includeDeprecated
            unplacedNames{
                id,
                wfo,
                fullNameString,
                gbifOccurrenceCount
            }  
        }
    }
`;

function CardUnplacedNames(props) {

    const { data, refetch } = useQuery(UNPLACED_NAMES_QUERY, {
        variables: { wfo: props.wfo, offset: 0 },
        notifyOnNetworkStatusChange: true,
        fetchPolicy: "cache-and-network",
        nextFetchPolicy: "cache-and-network"
    });

    function changePage(offset) {
        refetch({
            offset: offset
        })
    }

    // don't display if we have no names to display - but only after loading
    if (data && data.getUnplacedNames.totalUnplacedNames === 0) return null;

    let names = data ? data.getUnplacedNames.unplacedNames : [];

    function getButtons() {

        if (!data) return < Button variant="light" disabled={true} >&nbsp;</Button >;

        let firstButton = <Button variant="light" disabled={true} >&lt;&lt;</Button>
        if (data.getUnplacedNames.offset > 0) firstButton = <Button variant="light" disabled={false} onClick={e => changePage(0)} >&lt;&lt;</Button>

        let backButton = <Button variant="light" disabled={true} >&lt;</Button>
        if (data.getUnplacedNames.offset > 0) {
            let newOffset = data.getUnplacedNames.offset - data.getUnplacedNames.limit;
            if (newOffset < 0) newOffset = 0;
            backButton = <Button variant="light" disabled={false} onClick={e => changePage(newOffset)} >&lt;</Button>
        }

        let nextButton = <Button variant="light" disabled={true} >&gt;</Button>
        if (data.getUnplacedNames.offset < data.getUnplacedNames.totalUnplacedNames - data.getUnplacedNames.limit) {
            let newOffset = data.getUnplacedNames.offset + data.getUnplacedNames.limit;
            if (newOffset > data.getUnplacedNames.totalUnplacedNames - data.getUnplacedNames.limit) newOffset = data.getUnplacedNames.totalUnplacedNames - data.getUnplacedNames.limit;
            nextButton = <Button variant="light" disabled={false} onClick={e => changePage(newOffset)} >&gt;</Button>
        }

        let lastButton = <Button variant="light" disabled={true} >&gt;&gt;</Button>
        if (data.getUnplacedNames.offset < data.getUnplacedNames.totalUnplacedNames - data.getUnplacedNames.limit) {
            let newOffset = data.getUnplacedNames.totalUnplacedNames - (data.getUnplacedNames.totalUnplacedNames % data.getUnplacedNames.limit);
            lastButton = <Button variant="light" disabled={false} onClick={e => changePage(newOffset)} >&gt;&gt;</Button>
        }

        let numbersButton = <Button variant="light" disabled={true}>{data.getUnplacedNames.offset + 1} - {data.getUnplacedNames.offset + data.getUnplacedNames.unplacedNames.length} of {data.getUnplacedNames.totalUnplacedNames}</Button>;

        return <ButtonGroup className="me-2" aria-label="First group" size="sm">
            {firstButton}{' '}
            {backButton}{' '}
            {numbersButton}{' '}
            {nextButton}{' '}
            {lastButton}{' '}
        </ButtonGroup>

    }

    function getListItems() {

        if (!data) {
            let loopData = [];
            for (let index = 0; index < 15; index++) {
                loopData.push(<ListGroupItem key={index}><Spinner
                    as="span"
                    animation="grow"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                /></ListGroupItem>);

            }
            return loopData;
        } else {
            return names.map(n => {

                let gbifOccurrences = null;
                //console.log(n.gbifOccurrenceCount);
                if (n.gbifOccurrenceCount) {
                    gbifOccurrences = <span>&nbsp;[GBIF Occurrences: {n.gbifOccurrenceCount.toLocaleString("en-GB")}]</span>
                }

                return <ListGroupItem action
                    key={n.id}
                    onClick={(e) => { e.preventDefault(); window.location.hash = n.wfo; }}>
                    <span dangerouslySetInnerHTML={{ __html: n.fullNameString }} />
                    {gbifOccurrences}
                </ListGroupItem>
            })
        }



    }

    function getTotalUnplaced() {
        if (!data) return '-';
        return data.getUnplacedNames.totalUnplacedNames.toLocaleString();
    }


    return (
        <Card bg="secondary" text="white" className="wfo-unplaced-list" style={{ marginBottom: "1em" }}>
            <Card.Header>
                
                <OverlayTrigger
                    key="CardUnplacedNames-tooltip-overlay"
                    placement="top"
                    overlay={
                        <Tooltip id={`CardUnplacedNames-tooltip-text`}>
                            Names that have not been explicitly placed in the taxonomy or deprecated yet.
                        </Tooltip>
                    }
                >
                <span>Unplaced Names</span>
                </OverlayTrigger>
                
                <span style={{ fontSize: "80%", verticalAlign: "super" }} >{' '}<Badge pill bg="primary">{getTotalUnplaced()}</Badge></span> {' '}</Card.Header>
            <ListGroup style={{ maxHeight: "30em", overflow: "auto" }}>
                {getListItems()}
            </ListGroup>
            <Card.Footer aria-label="Toolbar with Button groups" style={{ textAlign: "center", display: "block" }} >
                {getButtons()}
            </Card.Footer>
        </Card>
    );

}
export default CardUnplacedNames;