import React, { useState } from "react";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import { useMutation, useQuery, gql } from "@apollo/client";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import AlertUpdate from "./AlertUpdate";


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
                    name.identifiers.map(id => {
                        return (<dl><dt>{id.displayName}:</dt> {
                            id.values.map(v => {

                                let dv;
                                try {
                                    let url = new URL(v);
                                    dv = <a target={id.kind} href={v}>{v}</a>;
                                } catch (_) {
                                    dv = v;
                                }

                                return <dd style={{ paddingLeft: "3em" }}>{dv}{","}</dd>
                            })
                        } </dl>);
                    })
                }
            </Card.Body>
        </Card>

    );

}
export default CardNameIdentifiers;
