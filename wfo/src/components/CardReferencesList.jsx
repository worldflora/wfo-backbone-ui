import React, { useState } from "react";
import ListGroup from "react-bootstrap/ListGroup";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { useMutation, useQuery, gql } from "@apollo/client";
import CardReferencesModal from "./CardReferencesModal";

const REFERENCES_QUERY = gql`
   query getNameForWfoId($wfo: String!){
       getNameForWfoId(id: $wfo){
        id,
        wfo,
        references{
            id,
            comment,
            subjectType
            reference{
                id,
                displayText,
                linkUri,
                kind,
                
            }
        }
       }
    }
`;

function CardReferencesList(props) {

    const { data, loading, refetch } = useQuery(REFERENCES_QUERY, {
        variables: { wfo: props.wfo }
    });

    const refsItems = [];
    if (data) {
        let refsData = data.getNameForWfoId.references;

        console.log(refsData);

        refsData.map(usage => {

            // don't render references that are not of the kind we want
            if (props.permittedKinds.indexOf(usage.reference.kind) === -1) return;

            // don't render references that are not linking to the things we want
            if (props.linkTo !== usage.subjectType) return;

            // fixme we should add thumbnails properly
            refsItems.push(
                <ListGroup.Item key={usage.id} >
                    <Row>
                        <Col>
                            <p style={{ marginBottom: "0.3em" }}><strong>{usage.reference.kind.charAt(0).toUpperCase() + usage.reference.kind.slice(1)}: </strong><a href={usage.reference.linkUri} target={usage.reference.kind} >{usage.reference.displayText}</a></p>
                            <p style={{ marginBottom: "0.3em", color: "gray" }}>{usage.comment}</p>
                        </Col>
                        <Col lg="2"><CardReferencesModal
                            headerText={props.modalHeader}
                            bodyText={props.modalText}
                            wfo={props.wfo}
                            linkTo={props.linkTo}
                            refetchList={refetch}
                            permittedKinds={props.permittedKinds}
                            refUsage={usage}
                        /></Col>
                    </Row>
                </ListGroup.Item>
            );
        });
    }

    return (
        <>
            <ListGroup variant="flush" style={{ maxHeight: "30em", overflow: "auto", borderTopColor: "rgb(200,200,200)" }} >
                {refsItems}
                <ListGroup.Item key="12345" >
                    <Row>
                        <Col>&nbsp;</Col>
                        <Col lg="2"><CardReferencesModal
                            headerText={props.modalHeader}
                            bodyText={props.modalText}
                            wfo={props.wfo}
                            linkTo={props.linkTo}
                            refetchList={refetch}
                            permittedKinds={props.permittedKinds}
                            addButtonText={props.addButtonText}
                            refUsage={null}
                        /></Col>
                    </Row>
                </ListGroup.Item>
            </ListGroup>

        </>
    );


}
export default CardReferencesList;