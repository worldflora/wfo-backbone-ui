import React from "react";
import Card from "react-bootstrap/Card";
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
            <Card.Body style={{ backgroundColor: "white", color: "gray" }} >
                {
                    name.identifiers.map((id, index) => {
                        return (<dl key={index}><dt>{id.displayName}:</dt> {
                            id.values.map((v, vindex) => {

                                let dv;
                                try {
                                    let url = new URL(v);
                                    dv = <a target={id.kind} href={url.href}>{v}</a>;
                                } catch (_) {
                                    dv = v;
                                }

                                return <dd key={vindex} style={{ paddingLeft: "3em" }}>{dv}{","}</dd>
                            })
                        } </dl>);
                    })
                }
            </Card.Body>
        </Card>

    );

}
export default CardNameIdentifiers;
