import React, { useState } from "react";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";
import { useLazyQuery, gql } from "@apollo/client";

const DOWNLOADS_QUERY = gql`
   query getDownloads($directoryName: String!, $fileEnding: String!){
        getDownloads(directoryName: $directoryName, fileEnding: $fileEnding){
            id,
            fileName,
            sizeHuman
            sizeBytes,
            uri,
            title,
            description,
            created
        }
    }
`;

function CardDownloads(props) {

    const [listHidden, setListHidden] = useState(false);

    const [getDownloads, { data, loading }] = useLazyQuery(DOWNLOADS_QUERY, {
        variables: {
            'directoryName': props.directoryName,
            'fileEnding': props.fileEnding
        },
        onCompleted() {
            setListHidden(false);
        }
    });


    let fileList = <Form.Group controlId="show-button" style={{ textAlign: "left", marginTop: "1em" }}>
        <Button variant="outline-secondary" onClick={e => { getDownloads(); setListHidden(false) }}>Show Files</Button>
    </Form.Group>

    if (loading) {
        fileList = <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
        </Spinner>;
    }

    if (data && !loading && !listHidden) {
        fileList =
            <>
                <ListGroup style={{ maxHeight: "30em", overflow: "auto" }}>
                    {data.getDownloads.map(file => {
                        const link = file.uri ? <p><strong>Download:</strong> <a href={file.uri}>{file.fileName}</a> - {file.sizeHuman} - {file.created}</p> : null;
                        const description = file.description ? <p>{file.description}</p> : null;
                        return (
                            <ListGroup.Item key={file.id}>
                                <p>
                                    <strong>{file.title}</strong>
                                </p>
                                {description}
                                {link}

                            </ListGroup.Item>
                        )
                    })}

                </ListGroup>
                <Form.Group controlId="hide-button" style={{ textAlign: "left", marginTop: "1em" }}>
                    <Button variant="outline-secondary" onClick={e => { setListHidden(true) }}>Hide Files</Button>
                </Form.Group>
            </>
    }


    return (
        <Card bg="light" text="dark" className="wfo-downloads" style={{ marginBottom: "1em" }}>
            <Card.Header>{props.header}</Card.Header>
            <Card.Body>
                <Card.Text>{props.children}</Card.Text>
                {fileList}
            </Card.Body>
        </Card>
    );

}
export default CardDownloads;