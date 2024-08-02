import React, { useState } from "react";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useQuery, gql } from "@apollo/client";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import Badge from "react-bootstrap/Badge";

const IPNI_QUERY = gql`
  query getNameForIpniDifferences($wfo: String!){
        getNameForWfoId(id: $wfo){
            id,
            wfo,
            ipni,
            nameString,
            speciesString,
            genusString,
            authorsString,
            citationMicro,
            fullNameString,
            ipniDifferences{
                id,
                retrieved,
                differenceCount,
                nameString,
                speciesString,
                genusString,
                authorsString,
                citationMicro
            }
        }
    }
`;

function CardNameIpni(props) {

    const { loading, data } = useQuery(IPNI_QUERY, {
        variables: { wfo: props.wfo }
    });

    let name = data ? data.getNameForWfoId : null;

    // display nothing if we have no name - initial load probably
    if(!name) return null;

    // display nothing if we don't have a preferred IPNI ID for this name
    if(!name.ipni) return null;

    // We have failed to retrive IPNI data
    if(!name.ipniDifferences.retrieved) return null;

    // we have got the data but there are no differences
    if (name.ipniDifferences.differenceCount === 0) return null;
 
    function handleSubmit(e){
        
        let nameString = name.ipniDifferences.nameString ? `\nMain Name is:\n\t"${name.ipniDifferences.nameString}" in IPNI\n\t"${name.nameString}" in Rhakhis.\n` : '';
        let genusString = name.ipniDifferences.genusString ? `\nThe genus name part is:\n\t"${name.ipniDifferences.genusString}" in IPNI\n\t"${name.genusString}" in Rhakhis.\n` : '';
        let speciesString = name.ipniDifferences.speciesString ? `\nThe species name part is:\n\t"${name.ipniDifferences.speciesString}" in IPNI\n\t"${name.speciesString}" in Rhakhis.\n` : '';
        let authorsString = name.ipniDifferences.authorsString ? `\nThe authors string is:\n\t"${name.ipniDifferences.authorsString}" in IPNI\n\t"${name.authorsString}" in Rhakhis.\n` : '';
        let citationMicro = name.ipniDifferences.citationMicro ? `\nThe publication citation string is:\n\t"${name.ipniDifferences.citationMicro}" in IPNI\n\t"${name.citationMicro}" in Rhakhis\n` : '';


let body = `LSID: ${name.ipni}
https://www.ipni.org/n/${name.ipni.split(':').pop()}

Dear IPNI editors,

There are differences between the entry in WFO Plant List (Rhakhis) and the current IPNI record that I can't resolve.
${nameString}${genusString}${speciesString}${authorsString}${citationMicro}
Which of these needs correcting?

You can view the Rhakhis record here: ${window.location}

There may be other information linked in Rhakhis to help resolve the issue.

Many thanks,

`;

        let emailData = {
            'subject': name.fullNameString.replace(/<[^>]*>/g, ''),
            'body' : body
        };

        let query = new URLSearchParams(emailData);
        let queryString = query.toString();
        queryString = queryString.replaceAll('+', '%20');

        window.location = `mailto:ipnifeedback@kew.org?${queryString}`;
    }

    return (
        <Form>
            <Card bg="secondary" text="white" style={{ marginBottom: "1em" }}>
                <Card.Header>
                    <OverlayTrigger
                        key="CardNameIpni-tooltip-overlay"
                        placement="top"
                        overlay={
                            <Tooltip id={`CardNameIpni-tooltip-text`}>
                                A tool for notifying IPNI about differences between this name record and theirs.
                            </Tooltip>
                        }
                    >
                        <span>IPNI Notifier</span>
                    </OverlayTrigger>
                    <span style={{
                        fontSize: "80%",
                        verticalAlign: "super"
                    }} >{' '}<Badge pill bg="danger" >{name.ipniDifferences.differenceCount}</Badge></span>
                </Card.Header>
                <Card.Body style={{ backgroundColor: "white", color: "gray" }} >
                    <Card.Text>
                        Inconsistencies with the record held at IPNI 
                        {' '}<a href={"https://www.ipni.org/" + name.ipni } target="ipni" >({name.ipni})</a> have been detected.
                        You may want to correct them here or contact the IPNI team for  
                        clarification. 
                        If you contact IPNI please leave a note in the comments above
                        so that nobody else contacts them on the same issue. 
                    </Card.Text>
                   
                        <Card.Text>
                            IPNI differences:
                    <ul>
                            {name.ipniDifferences.nameString ? <li><strong>Main Name: </strong>{name.ipniDifferences.nameString}</li> : null }
                            {name.ipniDifferences.genusString ? <li><strong>Genus Part: </strong>{name.ipniDifferences.genusString}</li> : null}
                            {name.ipniDifferences.speciesString ? <li><strong>Species Part: </strong>{name.ipniDifferences.speciesString}</li> : null}
                            {name.ipniDifferences.authorsString ? <li><strong>Author String: </strong>{name.ipniDifferences.authorsString}</li> : null}
                            {name.ipniDifferences.citationMicro ? <li><strong>Publication: </strong>{name.ipniDifferences.citationMicro}</li> : null}
                    </ul>
                        </Card.Text>  
    
                   <Form onSubmit={handleSubmit}>
                        <Form.Group as={Row} controlId="authorsValidate">
                            <Form.Label column style={{textAlign: 'right'}} >Compose an email to the IPNI team containing this information.</Form.Label>
                            <Col md="auto" >
                                <Form.Control type="button" onClick={handleSubmit} name="authorsValidate" value="Start email" />
                            </Col>
                        </Form.Group>
                    </Form>

                    
                </Card.Body>
            </Card>
        </Form>

    );

}
export default CardNameIpni;
