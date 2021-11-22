import React, { Component } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
//import OrcidCard from "./OrcidCard";
//import AssignmentsCard from "./AssignmentsCard";


class PageSearch extends Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {

        return (
            <Container style={{ marginTop: "2em" }}>
                <Row>
                    <Col>
                        <h2>Search Page</h2>
                    </Col>
                </Row>
            </Container>
        );


    }


}
export default PageSearch