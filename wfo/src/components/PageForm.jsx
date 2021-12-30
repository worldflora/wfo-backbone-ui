import React from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import CardChildren from "./CardChildren";
import CardSynonyms from "./CardSynonyms";
import CardAncestors from "./CardAncestors";
import CardFormHeader from "./CardFormHeader";
import CardNameParts from "./CardNameParts";
import CardPlacement from "./CardPlacement";
import CardNameStatus from "./CardNameStatus";
import CardUnplacedNames from "./CardUnplacedNames";

/*
    Design pattern of using keys to refresh component
    https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#recommendation-fully-controlled-component

*/


function PageForm(props) {

    //if (!name) return null;
    return (

        <Container fluid>
            <Row>
                <Col>
                    <CardAncestors wfo={props.wfo} />
                </Col>
            </Row>
            <Row>
                <Col>
                    <CardFormHeader wfo={props.wfo} />
                    <CardNameParts wfo={props.wfo} />
                    <CardNameStatus wfo={props.wfo} />
                    <CardUnplacedNames wfo={props.wfo} />
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
                <Col xs={4}>
                    <CardChildren wfo={props.wfo} />
                    <CardSynonyms wfo={props.wfo} />
                    <CardPlacement wfo={props.wfo} />
                </Col>
            </Row>
        </Container>

    );



}
export default PageForm