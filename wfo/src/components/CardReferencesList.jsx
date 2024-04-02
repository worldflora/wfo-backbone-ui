import React from "react";
import ListGroup from "react-bootstrap/ListGroup";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import { useQuery, gql } from "@apollo/client";
import CardReferencesModal from "./CardReferencesModal";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

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
                thumbnailUri
            }
        }
       }
    }
`;

function CardReferencesList(props) {

    const { data, refetch } = useQuery(REFERENCES_QUERY, {
        variables: { wfo: props.wfo }
    });

    const refsItems = [];
    if (data) {

        let refsData = data.getNameForWfoId.references;

        refsData.map(usage => {

            // don't render references that are not linking to the things we want
            if (props.linkTo !== usage.subjectType) return null;

            let thumbnail = null;
            if (usage.reference.thumbnailUri) {
                thumbnail = <a href={usage.reference.linkUri} target={usage.reference.kind} >
                    <img alt={usage.reference.displayText} src={usage.reference.thumbnailUri} style={{ maxHeight: "70px", float: "right" }} />
                </a>

            }

            // fixme we should add thumbnails properly
            refsItems.push(
                <ListGroup.Item key={usage.id} >
                    <Row>
                        <Col>
                            {thumbnail}
                            <p style={{ marginBottom: "0.3em" }}>
                                <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">{usage.id}</Tooltip>}>
                                    <strong>{usage.reference.kind.charAt(0).toUpperCase() + usage.reference.kind.slice(1)}: </strong>
                                </OverlayTrigger>
                                <a href={usage.reference.linkUri} target={usage.reference.kind} >{usage.reference.displayText}</a>
                            </p>
                            <p style={{ marginBottom: "0.3em", color: "gray" }}>{usage.comment}</p>
                        </Col>
                        <Col lg="2"><CardReferencesModal
                            headerText={props.modalHeader}
                            bodyText={props.modalText}
                            wfo={props.wfo}
                            linkTo={props.linkTo}
                            refetchList={refetch}
                            preferredKind={props.preferredKind}
                            refUsage={usage}
                        />
                        </Col>
                    </Row>
                </ListGroup.Item>
            );
            return true;

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
                            preferredKind={props.preferredKind}
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