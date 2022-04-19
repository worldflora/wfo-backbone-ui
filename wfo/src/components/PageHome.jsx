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
                            Although the primary role of Rhakhis is to maintain the taxonomy for the <a href="http://www.worldfloraonline.org/">World Flora Online</a> we want to make the data
                            as accessible as possible to anyone who may need it. We make versioned releases with DOIs every six months, frequent exports of the current data
                            in multiple formats and providing access via APIs. If we don't already provide what you need please contact us.
                        </p>
                        <p>
                            If you are looking for <strong>information on a particular species</strong> your best option is to browse the whole World Flora Online (including descriptions and images and much more) at <a href="http://www.worldfloraonline.org/">worldfloraonline.org</a>.
                        </p>
                        <p>
                            If you are just looking for <strong>stable nomenclatural data</strong> (lists of genera and species) then visit <a href="https://wfoplantlist.org/">wfoplantlist.org</a>
                        </p>
                        <p>
                            If you are a taxonomist, even if you aren't an active data editor, you can browse the live data here by logging in with your <a href="https://orcid.org/">ORCID iD</a> at the top right of this page.
                            We require login because this is primarily an editing application not a website capable of supporting high levels of traffic.
                        </p>
                        <Card>
                            <Card.Header>
                                Getting Started
                            </Card.Header>
                            <Card.Body>
                                <Card.Text>You will need to login with your <a href="https://orcid.org/">ORCID iD</a> to use Rhakhis.</Card.Text>
                                <Card.Text>Under the <a href="#alpha">A-Z tab</a> you can just start typing the name you are interested in and matching names will be suggested - like looking it up in an index.</Card.Text>
                                <Card.Text>The <a href="#browse">Browse tab</a> allows you to navigate the hierarchy of names and synonyms.</Card.Text>
                                <Card.Text>If you want to find a name that you might not be sure of the ending you can use the <a href="#match">Matching tab</a>.</Card.Text>
                                <Card.Text>Under the <a href="#data">Data tab</a> you'll find snapshot of data in different formats to download.</Card.Text>
                            </Card.Body>
                        </Card>

                    </Col>


                    <Col xs={4}>
                        <Card>
                            <Card.Header>
                                <strong>Feedback</strong>
                            </Card.Header>
                            <Card.Body>
                                <Card.Title>
                                    Data Issues
                                </Card.Title>
                                <Card.Text>
                                    In the case of missing or incorrect data.
                                </Card.Text>
                                <ol>
                                    <li>If you can edit the associated name go ahead and correct it.</li>
                                    <li>If you can't edit it check if there is an editor listed on the right of the page and contact them about your corrections.</li>
                                    <li>If there is no editor set for this name or you can't contact them please contact the TENs manager <a href="mailto:aelliott@rbge.org.uk">Alan Elliott</a> directly.</li>
                                </ol>
                                <Card.Title>
                                    System Issues
                                </Card.Title>
                                <ol>
                                    <li>If Rhakhis has become unresponsive please contact the technical lead <a href="mailto:rhyam@rbge.org.uk">Roger Hyam</a> directly.</li>
                                    <li>If you come across anything that looks like a bug or have a suggested improvement please <a href="https://github.com/rogerhyam/wfo-backbone-ui/issues/">raised an issue in GitHub</a>.
                                        Don't assume that it has already been raised or is too big or too small. Check the <a href="https://github.com/rogerhyam/wfo-backbone-ui/issues/">GitHub issues page</a> and if in doubt create a new issue.
                                        It is far preferable to have to deal with too many issues than find out later that there was something we could have fixed.
                                    </li>
                                </ol>
                            </Card.Body>
                        </Card>

                    </Col>
                </Row>
            </Container >
        );


    }


}
export default PageHome