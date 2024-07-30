import React from "react";
import Card from "react-bootstrap/Card";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import ListGroup from "react-bootstrap/ListGroup";
import { useQuery, gql } from "@apollo/client";


const IDENTIFIERS_QUERY = gql`
   query getNameIdentifiers($wfo: String!){
        getNameForWfoId(id: $wfo){
            id,
            identifiers{
                kind,
                displayName,
                values,
                preferredValue
            }
        }
    }
`;

function CardNameIdentifiers(props) {

    const { data } = useQuery(IDENTIFIERS_QUERY, {
        variables: { wfo: props.wfo }
    });

    let name = data ? data.getNameForWfoId : null;
    if (!name) return null;

    return (
        <Card bg="secondary" text="white" style={{ marginBottom: "1em" }}>
            <OverlayTrigger
                key="identifiers-head-display-text-overlay"
                placement="top"
                overlay={
                    <Tooltip id={`tooltip-identifiers-head-display-text`}>
                        Multiple alternative identifiers are tracked for names.
                        Those that are considered preferred are presented as links.
                    </Tooltip>
                }
            >
            <Card.Header>Identifiers</Card.Header>
            </OverlayTrigger>
            <ListGroup variant="flush" style={{ maxHeight: "30em", overflow: "auto", backgroundColor: "white", color: "gray" }} >
                {
                    name.identifiers.map((id, index) => {
                        return (<ListGroup.Item key={index}><strong>{id.displayName}:</strong> {
                            
                            id.values.map((v, vindex, values) => {

                                // work out the display value
                                let dv;

                                // if it is a URL then make it a link
                                try {
                                    let url = new URL(v);
                                    if(url.protocol === 'http:' || url.protocol === 'https:'){
                                        let urlDisplayed = v;
                                        if (v.length > 10) urlDisplayed = v.substring(0, 30) + "...";
                                        dv = <a target={id.kind} href={url.href}>{urlDisplayed}</a>;
                                    }else{
                                        dv = v;
                                    }
                                } catch (_) {
                                    dv = v;
                                }

                                // we add a comma if we are not on the last one
                                let separator = "; ";
                                if (vindex + 1 === values.length) {
                                    separator = "";
                                }

                                // we present preferred IDs as links
                                // non-preferred are just text
                                if (id.preferredValue !== null && v === id.preferredValue){

                                    
                                    if (id.kind === 'ipni') {
                                        dv = <a target='ipni' href={'https://www.ipni.org/n/' + v}>{v}</a>;
                                    }

                                    if (id.kind === 'wfo') {
                                        dv = <a target='wfo' href={'https://list.worldfloraonline.org/' + v}>{v}</a>;
                                    }

                                }

                                return <span key={vindex}>{dv}{separator}</span>
                                
                            })
                        }.</ListGroup.Item>);
                    })
                }
            </ListGroup>
        </Card>

    );

}
export default CardNameIdentifiers;
