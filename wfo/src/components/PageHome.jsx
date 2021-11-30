import React, { Component } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
//import OrcidCard from "./OrcidCard";
//import AssignmentsCard from "./AssignmentsCard";


class PageHome extends Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {

        if (this.props.hash != 'home') return null;

        return (
            <Container style={{ marginTop: "2em" }}>
                <Row>
                    <Col>
                        <h2>Home Page</h2>
                    </Col>
                </Row>
            </Container>
        );


    }


}
export default PageHome