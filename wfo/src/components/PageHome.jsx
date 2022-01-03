import React, { Component } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";


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
                        <Card>
                            <Card.Body>
                                <Card.Text>

                                    <p><a href="#wfo-9499999999">#wfo-9499999999</a></p>
                                    <p><a href="#wfo-9499999998">#wfo-9499999998</a></p>
                                    <p><a href="#wfo-0000003319">#wfo-0000003319</a> - with synonyms</p>
                                    <p><a href="#home">#home</a></p>
                                    <p><a href="#alpha">#alpha</a></p>
                                    <h2>Stats</h2>
                                    <p>Some stats about this taxon</p>
                                </Card.Text>
                            </Card.Body>
                        </Card>

                    </Col>
                </Row>
            </Container>
        );


    }


}
export default PageHome