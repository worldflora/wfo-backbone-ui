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
                        <h2>Rhakhis: The WFO Taxonomic Backbone Management System</h2>
                        <p>We are helping address the biodiversity crisis by collaborating to build a single, open dataset that is a definitive source for botanical nomenclature
                            and includes a consensus classification of plants. Specialists in different taxonomic groups (Taxonomic Expert Networks - TENs) contribute either by submitting files,
                            through <a target="wikipedia" href="https://en.wikipedia.org/wiki/API">APIs</a> or using this graphical interface directly.
                            We publish regular snapshots of the data for incorporation into other projects.
                            Our intention is to make the data as comprehensive and useful as possible for as many people as we can.
                        </p>
                        <p>
                            Browse the whole World Flora Online (including descriptions and images and much more) at <a href="http://www.worldfloraonline.org/">worldfloraonline.org</a>
                        </p>
                        <p>
                            Explore the official snapshots of this taxonomic backbone through a single combined view at <a href="https://wfoplantlist.org/">wfoplantlist.org</a>
                        </p>
                        <p>
                            You are also free to browse this
                        </p>
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