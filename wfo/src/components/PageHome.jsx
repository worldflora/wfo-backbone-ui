import React, { Component } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";


class PageHome extends Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {

        return (
            <Container style={{ marginTop: "2em" }}>
                <Row>
                    <Col>
                        <h2>Home Page</h2>
                        <h2>Feedback</h2>
                        <p>It is important to let us know what you think or any issues you may have.</p>

                    </Col>
                </Row>
            </Container>
        );


    }


}
export default PageHome