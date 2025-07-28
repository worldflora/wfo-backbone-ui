import React, { useState } from "react";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Badge from "react-bootstrap/Badge";
import LinkOrcid from "./LinkOrcid";

import {
    useLazyQuery,
    gql
} from "@apollo/client";

function PageActivityUsers(props) {

    const [visible, setVisible] = useState(props.visible)
    const [offset, setOffset] = useState(0);
    const [currentOffset, setCurrentOffset] = useState();
    const [limit, setLimit] = useState(100);
    const [days, setDays] = useState();
    const [currentDays, setCurrentDays] = useState();

    const USER_ACTIVITY = gql`
    query getMostActiveUsers($limit: Int, $offset: Int, $days: Int ){
        getMostActiveUsers(limit: $limit, offset: $offset, days: $days){
            id
            isAnonymous
            name
            orcid
            activityCount
        }
    }
    `;

    const [getData, { loading, error, data }] = useLazyQuery(USER_ACTIVITY);

    if (props.visible) {
        if (!visible || currentOffset != offset || currentDays != days) {
            setVisible(true);
            setCurrentOffset(offset);
            setCurrentDays(days);
            getData({ variables: { limit, offset, days } });
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
    if (data && data.getMostActiveUsers.length >= limit) {
        let newOffset = offset + data.getMostActiveUsers.length;
        nextButton = <Button variant="light" disabled={false} onClick={e => setOffset(newOffset)} > Next Page  &gt;</Button>
    }

    function renderUserList(users) {
        return (
            data.getMostActiveUsers.map(user => {
                return (
                    <Row key={user.id}>
                        <Col>
                            <Card border="primary" style={{ marginBottom: '0.5em', borderLeftWidth: '1em', borderRightWidth: '1em' }}>
                                <Card.Body>
                                    <Card.Text>
                                        <Badge bg="primary">{user.activityCount}</Badge>
                                        {" "}
                                        <strong>{user.name}</strong>
                                        {" "}
                                        <LinkOrcid user={user} />
                                        {" "}
                                        <Button style={{ float: "right" }} variant="outline-secondary" size="sm" onClick={() => { handleShowChanged(user) }}>Show changed</Button>
                                    </Card.Text>
                                </Card.Body>
                            </Card>

                        </Col>
                    </Row>
                )
            })
        );
    }

    function renderNoResults(loading) {
        if (loading) {
            return <p>Loading ...</p>;
        } else {
            return <p>No activity</p>
        }
    }

    function handleShowChanged(user) {
        console.log(user);
        props.setChosenTab('name_activity');
        props.setDisplayedUserId(user.id);
    }

    // build a distances array with the modified dates in them
    // also an index list

    return (
        <Container style={{ marginTop: "1em" }}>

            <div style={{ float: "right" }}>
                <Form.Select size="sm" aria-label="Filter to a time period" value={props.userId} onChange={e => 
                    {
                        // careful to pass null rather than NaN
                        setDays(e.currentTarget.value == -1 ? null : parseInt(e.currentTarget.value));
                    }
                }>
                    <option value="-1">- All time -</option>
                    <option value="1">1 day</option>
                    <option value="2">2 days</option>
                    <option value="3">3 days</option>
                    <option value="4">4 days</option>
                    <option value="5">5 days</option>
                    <option value="6">6 days</option>
                    <option value="7">7 days</option>
                    <option value="30">30 days</option>
                    <option value="60">60 days</option>
                    <option value="365">365 days</option>
                </Form.Select>
            </div>

            <h2 style={{ marginBottom: "0.5em" }}>Most Active Editors<span style={{ fontSize: "33%", verticalAlign: "super" }}  >* Excludes admins</span></h2>

            {data && data.getMostActiveUsers.length > 0 ? renderUserList(data.getMostActiveUsers) : renderNoResults(loading)}

            <ButtonGroup className="me-2" aria-label="First group" size="sm">
                {backButton}{' | '}{nextButton}
            </ButtonGroup>

        </Container>
    );

}
export default PageActivityUsers