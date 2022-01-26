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
import CardTaxonHybridStatus from "./CardTaxonHybridStatus";
import CardNameIdentifiers from "./CardNameIdentifiers";
import CardNameHomonyms from "./CardNameHomonyms";
import CardEditors from "./CardEditors";

function PageForm(props) {

    if (!props.wfo) return null;

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
                    <CardNameIdentifiers wfo={props.wfo} />
                </Col>
                <Col xs={4}>
                    <CardChildren wfo={props.wfo} />
                    <CardSynonyms wfo={props.wfo} />
                    <CardPlacement wfo={props.wfo} />
                    <CardTaxonHybridStatus wfo={props.wfo} />
                    <CardNameTypeRelationships wfo={props.wfo} />
                    <CardNameHomonyms wfo={props.wfo} />
                    <CardEditors wfo={props.wfo} />
                </Col>
            </Row>
        </Container>

    );



}
export default PageForm