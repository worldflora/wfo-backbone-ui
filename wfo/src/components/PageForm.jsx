import React from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import CardChildren from "./CardChildren";
import CardSynonyms from "./CardSynonyms";
import CardAncestors from "./CardAncestors";
import CardFormHeader from "./CardFormHeader";
import CardNameParts from "./CardNameParts";
import CardPlacement from "./CardPlacement";
import CardNameStatus from "./CardNameStatus";
import CardUnplacedNames from "./CardUnplacedNames";
import CardNameAuthors from "./CardNameAuthors";
import CardNamePublication from "./CardNamePublication";
import CardNameComment from "./CardNameComment";
import CardNameTypeRelationships from "./CardNameTypeRelationships";

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
                    <CardNameAuthors wfo={props.wfo} />
                    <CardNamePublication wfo={props.wfo} />
                    <CardUnplacedNames wfo={props.wfo} />
                    <CardNameComment wfo={props.wfo} />
                </Col>
                <Col xs={4}>
                    <CardChildren wfo={props.wfo} />
                    <CardSynonyms wfo={props.wfo} />
                    <CardPlacement wfo={props.wfo} />
                    <CardNameTypeRelationships wfo={props.wfo} />
                </Col>
            </Row>
        </Container>

    );



}
export default PageForm