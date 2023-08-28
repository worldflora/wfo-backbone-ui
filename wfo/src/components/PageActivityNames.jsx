import React, { useState } from "react";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import CardSearchResults from "./CardSearchResults";
import SelectUser from "./SelectUser";

import {
    useLazyQuery,
    gql
} from "@apollo/client";


function PageActivityNames(props) {

    const [visible, setVisible] = useState()
    const [offset, setOffset] = useState(0);
    const [currentOffset, setCurrentOffset] = useState();
    const [limit, setLimit] = useState(100);
    const [currentUserId, setCurrentUserId] = useState();

    const NAME_ACTIVITY = gql`
    ${props.nameFieldsFragment}
    query getRecentChanges($limit: Int, $offset: Int, $userId: Int ){
        getRecentChanges(limit: $limit, offset: $offset, userId: $userId){
            ...nameFields
        }
    }
    `;

    const [getData, { loading, error, data }] = useLazyQuery(NAME_ACTIVITY);

    if (props.visible) {
        if (!visible || currentUserId != props.userId || currentOffset != offset) {
            setVisible(true);
            setCurrentUserId(props.userId);
            setCurrentOffset(offset);
            getData({ variables: { limit, offset, userId: props.userId } })
        }
    } else {
        if (visible) setVisible(false);
    }

    let backButton = <Button variant="light" disabled={true} >&lt; Previous Page</Button>
    if (offset > 0) {
        let newOffset = offset - limit;
        if (newOffset < 0) newOffset = 0;
        backButton = <Button variant="light" disabled={false} onClick={e => setOffset(newOffset)} >&lt; Previous Page</Button>
    }

    let nextButton = <Button variant="light" disabled={true} >Next Page &gt;</Button>
    if (data && data.getRecentChanges.length >= limit) {
        let newOffset = offset + data.getRecentChanges.length;
        nextButton = <Button variant="light" disabled={false} onClick={e => setOffset(newOffset)} > Next Page  &gt;</Button>
    }

    // build a distances array with the modified dates in them
    // also an index list

    return (
        <Container style={{ marginTop: "1em" }}>

            <div style={{ float: "right" }}>
                <SelectUser setUserId={id => { props.setUserId(id); setOffset(0); }} userId={props.userId ? props.userId : ''} />
            </div>

            <h2 style={{ marginBottom: "0.5em" }}>Recently Changed Names</h2>

            <CardSearchResults
                names={data ? data.getRecentChanges : null}
                distances={data ? [] : null}
                loading={loading}
                error={error}
                showModified={true}
            />

            <ButtonGroup className="me-2" aria-label="First group" size="sm">
                {backButton}{' | '}{nextButton}
            </ButtonGroup>

        </Container>
    );

}
export default PageActivityNames