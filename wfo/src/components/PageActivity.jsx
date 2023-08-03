import React, { useState } from "react";
import Container from "react-bootstrap/Container";
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import PageActivityNames from "./PageActivityNames";
import PageActivityUsers from "./PageActivityUsers";

function PageActivity(props) {

    // build a distances array with the modified dates in them
    // also an index list

    const [chosenTab, setChosenTab] = useState("name_activity");
    const [displayedUserId, setDisplayedUserId] = useState(null);

    return (
        <Container style={{ marginTop: "1em" }}>
            <Tabs
                defaultActiveKey={chosenTab}
                activeKey={chosenTab}
                onSelect={(k, e) => {
                    setChosenTab(k);
                }}
                id="activity-tabs"
                className="mb-3"
            >
                <Tab eventKey="name_activity" title="Names" >
                    <PageActivityNames nameFieldsFragment={props.nameFieldsFragment} visible={props.visible} setChosenTab={setChosenTab} userId={displayedUserId} setUserId={setDisplayedUserId} />
                </Tab>
                <Tab eventKey="user_activity" title="Editors">
                    <PageActivityUsers nameFieldsFragment={props.nameFieldsFragment} visible={props.visible} setChosenTab={setChosenTab} setDisplayedUserId={setDisplayedUserId} />
                </Tab>
            </Tabs>

        </Container>
    );

}
export default PageActivity