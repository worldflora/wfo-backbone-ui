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
                        <p>We are helping to address the biodiversity crisis by collaborating to build a comprehensive, open dataset of botanical nomenclature and
                            a consensus classification of plants. Specialists in different taxonomic groups contribute either by submitting data files,
                            interacting with <a target="wikipedia" href="https://en.wikipedia.org/wiki/API">APIs</a> or by using this graphical interface directly.
                        </p>
                        <p>
                            Although the primary role of the Rhakhis is to maintain the taxonomy for the <a href="http://www.worldfloraonline.org/">World Flora Online</a> we want to make all the data
                            as accessible as possible to anyone who may need it. We make versioned releases with DOIs every six months, nightly exports of the current data
                            in multiple formats and providing access via APIs. If we don't already provide what you need please contact us.
                        </p>
                        <p>
                            If you are looking for <strong>information on a particular species</strong> your best option is to browse the whole World Flora Online (including descriptions and images and much more) at <a href="http://www.worldfloraonline.org/">worldfloraonline.org</a>.
                        </p>
                        <p>
                            If you are just looking for <strong>stable nomenclatural data</strong> (lists of genera and species) then visit <a href="https://wfoplantlist.org/">wfoplantlist.org</a>
                        </p>
                        <p>
                            If you are a taxonomist, even if you aren't an active data editor, you can browse the live data here by logging in with your <a href="https://orcid.org/">ORCID ID</a> at the top right of this page.
                            We require login as this is an editing application and not a website capable of supporting high levels of traffic.
                        </p>
                        <h2>Feedback</h2>
                        <p>It is important to let us know what you think or any issues you may have.</p>

                    </Col>


                    <Col xs={4}>
                        <Card>
                            <Card.Header>
                                Some test links
                            </Card.Header>
                            <Card.Body>

                                <Card.Text><a href="#wfo-9499999999">#wfo-9499999999</a></Card.Text>
                                <Card.Text><a href="#wfo-9499999998">#wfo-9499999998</a></Card.Text>
                                <Card.Text><a href="#wfo-0000003319">#wfo-0000003319</a> - with synonyms</Card.Text>
                                <Card.Text><a href="#home">#home</a></Card.Text>
                                <Card.Text><a href="#alpha">#alpha</a></Card.Text>
                                <Card.Header>Stats</Card.Header>
                                <Card.Text>Some stats about this taxon</Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        );


    }


}
export default PageHome