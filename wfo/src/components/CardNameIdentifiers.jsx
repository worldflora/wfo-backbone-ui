import React from "react";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import { useQuery, gql } from "@apollo/client";


const IDENTIFIERS_QUERY = gql`
   query getNameIdentifiers($wfo: String!){
        getNameForWfoId(id: $wfo){
            id,
            identifiers{
                kind,
                displayName,
                values
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
            <Card.Header>Identifiers</Card.Header>
            <ListGroup variant="flush" style={{ maxHeight: "30em", overflow: "auto", backgroundColor: "white", color: "gray" }} >
                {
                    name.identifiers.map((id, index) => {
                        return (<ListGroup.Item key={index}><strong>{id.displayName}:</strong> {
                            id.values.map((v, vindex, values) => {

                                // work out the display value
                                let dv;
                                try {
                                    let url = new URL(v);
                                    let urlDisplayed = v;
                                    if (v.length > 10) urlDisplayed = v.substring(0, 30) + "...";
                                    dv = <a target={id.kind} href={url.href}>{urlDisplayed}</a>;
                                } catch (_) {
                                    dv = v;
                                }

                                // if this is a wfo id then we link to the main website
                                let pattern = /^wfo-[0-9]{10}$/;
                                if (pattern.test(v)) {
                                    dv = <a target='wfo' href={'http://www.worldfloraonline.org/taxon/' + v}>{v}</a>;
                                }

                                // if this is an ipni id then we link to that
                                pattern = /^[0-9]+-[0-9]+$/;
                                if (id.kind === 'ipni' && pattern.test(v)) {
                                    dv = <a target='ipni' href={'https://www.ipni.org/n/' + v}>{v}</a>;
                                }

                                // if this is an tpl id then we link to that
                                if (id.kind === 'tpl') {
                                    dv = <a target='tpl' href={'http://www.theplantlist.org/tpl1.1/record/' + v}>{v}</a>;
                                }

                                // we add a comma if we are not on the last one
                                let separator = ", ";
                                if (vindex + 1 === values.length) {
                                    separator = "";
                                }
                                return <span key={vindex}>{dv}{separator}</span>
                            })
                        } </ListGroup.Item>);
                    })
                }
            </ListGroup>
        </Card>

    );

}
export default CardNameIdentifiers;
