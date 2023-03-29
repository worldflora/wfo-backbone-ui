import React, { useState } from "react";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import CardSearchResults from "./CardSearchResults";
import SelectUser from "./SelectUser";

import {
    useQuery,
    gql
} from "@apollo/client";

function handleSubmit(event) {
    event.preventDefault();
    console.log(event);
}

function PageActivity(props) {

    const [visible, setVisible] = useState(props.visible)
    const [offset, setOffset] = useState(0);
    const [limit, setLimit] = useState(100);
    const [userId, setUserId] = useState();

    const NAME_ACTIVITY = gql`
    ${props.nameFieldsFragment}
    query getRecentChanges($limit: Int, $offset: Int, $userId: Int ){
        getRecentChanges(limit: $limit, offset: $offset, userId: $userId){
            ...nameFields
        }
    }
    `;

    const { loading, error, data, refetch } = useQuery(NAME_ACTIVITY, {
        variables: { limit, offset, userId },
    });

    if (props.visible) {
        if (!visible) {
            setVisible(true);
            refetch();
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
        <Container style={{ marginTop: "2em" }}>

            <div style={{ float: "right" }}>
                <SelectUser setUserId={id => {setUserId(id); setOffset(0);}} userId={userId} />
            </div>

            <h2>Recently Changed Names</h2>
            
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
export default PageActivity