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
import CardNameIpni from "./CardNameIpni";
import CardNameComment from "./CardNameComment";
import CardNameTypeRelationships from "./CardNameTypeRelationships";
import CardTaxonStatus from "./CardTaxonStatus";
import CardNameIdentifiers from "./CardNameIdentifiers";
import CardNameHomonyms from "./CardNameHomonyms";
import CardEditors from "./CardEditors";
import CardReferences from "./CardReferences";
import CardTaxonDescription from "./CardTaxonDescription";

function PageForm(props) {

    if (!props.wfo) return null;

    //if (!name) return null;
    return (
        <Container>
            <Row>
                <Col>
                    <CardAncestors wfo={props.wfo} />
                </Col>
            </Row>
            <Row>
                <Col md={8}>
                    <CardFormHeader wfo={props.wfo} />
                    <CardNameParts wfo={props.wfo} />
                    <CardNameStatus wfo={props.wfo} />
                    <CardNameAuthors wfo={props.wfo} />
                    <CardNamePublication wfo={props.wfo} />
                    <CardReferences
                        wfo={props.wfo}
                        linkTo="nomenclatural"
                        headerColour='secondary'
                        headerTextColour='white'
                        headerText="Nomenclatural References"
                        modalHeader="Nomenclatural Reference"
                        preferredKind={'literature'}
                        addButtonText="Add Reference"
                        toolTip="Resources relating to the nomenclatural status of this name."
                    >
                        A reference supporting the nomenclature of this name
                    </CardReferences>
                    <CardUnplacedNames wfo={props.wfo} />
                    <CardReferences
                        wfo={props.wfo}
                        linkTo="treatment"
                        headerColour='warning'
                        headerTextColour='black'
                        headerText="Other Treatments"
                        modalHeader="Treatments"
                        preferredKind={'literature'}
                        addButtonText="Add Treatment"
                        toolTip="Other taxonomic works that include this name."
                    >
                        Treatments
                    </CardReferences>
                    <CardNameComment wfo={props.wfo} />
                    <CardNameIpni wfo={props.wfo} />
                    <CardNameIdentifiers wfo={props.wfo} />
                </Col>
                <Col md={4}>
                    <CardChildren wfo={props.wfo} />
                    <CardSynonyms wfo={props.wfo} />
                    <CardPlacement wfo={props.wfo} />
                    <CardReferences
                        wfo={props.wfo}
                        linkTo="taxonomic"
                        headerColour='warning'
                        headerTextColour='black'
                        headerText="Taxonomic Sources"
                        modalHeader="Taxonomic Source"
                        preferredKind={'literature'}
                        addButtonText="Add Source"
                        toolTip="Resources on which the current taxonomic placement is based."
                    >
                        References about taxonomic sources..
                    </CardReferences>
                    <CardTaxonStatus wfo={props.wfo} />
                    <CardNameTypeRelationships wfo={props.wfo} />
                    <CardNameHomonyms wfo={props.wfo} />
                    <CardEditors wfo={props.wfo} />
                </Col>
            </Row>
        </Container>

    );



}
export default PageForm