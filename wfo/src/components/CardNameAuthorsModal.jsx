import React from "react";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import ListGroup from "react-bootstrap/ListGroup";
import { useLazyQuery, gql, useMutation } from "@apollo/client";
import Spinner from "react-bootstrap/Spinner";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

const AUTHORS_VALIDATE_QUERY = gql`
query getAuthorValidation($authorsString: String!, $wfo: String!){
    getAuthorTeamMembersFromString(authorsString: $authorsString, wfo: $wfo){
        id
        abbreviation
        label
        wikiUri
        imageUri
        referencePresent
    }
}
`;

const ADD_AUTHOR_REF = gql`
        mutation  addAuthorRef(
            $linkUri:       String!
            $displayText:   String!
            $comment:       String!
            $wfo:           String!
            ){
          updateReference(
                kind:           "person",
                linkUri:        $linkUri,
                displayText:    $displayText,
                comment:        $comment,
                subjectType:    "nomenclatural",
                wfo:            $wfo,
                referenceId:    null
          ){
            name,
            success,
            message,
            children{
              name,
              success,
              message
            }
          }
        }
`;

function CardNameAuthorsModal(props) {

    const [modalShow, setModalShow] = React.useState(false);

    const [getData, { data, loading }] = useLazyQuery(AUTHORS_VALIDATE_QUERY, {
        variables: { authorsString: props.authorsString, wfo: props.wfo }
    });

    const [addAuthorRef] = useMutation(ADD_AUTHOR_REF, {
        refetchQueries: ['getNameForWfoId', 'getAuthorValidation']
    });

    function hide() {
        setModalShow(false);
    }

    function show() {
        getData();
        setModalShow(true);
    }

    function createReference(e){

        // do nothing if we have no data
        if(!data) return;

        // get the author we are talking about
        data.getAuthorTeamMembersFromString.map(author => {
            if (author.id === e.target.value){
                addAuthorRef(
                    {
                        variables: {
                            linkUri: author.wikiUri,
                            displayText: author.label,
                            comment: `Based on occurence of '${author.id}' in the author string.`,
                            wfo: props.wfo,
                        }
                    }
                );
                return true;
            }
            return false;
        });

    }

    

    let spinner = null;
    if (loading) {
        spinner = (<Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
        </Spinner>)
    }
    let authorsList = null;
    if(data){
        authorsList = (
            <ListGroup  style={{ maxHeight: "30em", overflow: "auto", borderTopColor: "rgb(200,200,200)" }} >
                {data.getAuthorTeamMembersFromString.map(author => {

                    let comment = author.referencePresent ? <p>Author is linked to from the references.</p> : <p>Author is <strong>not</strong> linked from the references.</p>;
                    if (!author.wikiUri) comment = 
                            <span>No botanist was found in <a href="https://www.wikidata.org/wiki/Wikidata:Main_Page" target="wikidata">Wikidata</a> with the author abbreviation
                            (<a href="https://www.wikidata.org/wiki/Property:P428" target="wikidata">P428</a>) set to 
                            '{author.abbreviation}'.
                            Either correct the abbreviation here or create a record in Wikidata with this author abbreviation.</span>;
                    
                    return (
                        <ListGroup.Item key={author.id} >
                            <Row>
                                <Col>
                                    <p style={{ marginBottom: "0.3em" }}>
                                        <strong>{author.abbreviation}: </strong>
                                        <a href={author.wikiUri} target="wikidata" >{author.label}</a>
                                        {comment}
                                    </p>
                                </Col>
                                {author.wikiUri && !author.referencePresent ?
                                <Col lg="3" style={{textAlign: 'right'}}>
                                        <Form><Button variant="outline-secondary" size="sm" value={author.id} onClick={createReference}>Add Reference</Button></Form>
                                </Col> : ''}
                            </Row>
                        </ListGroup.Item>
                    );
                })}
            </ListGroup>

        );
    }


    return (
        <>
            <Form.Control type="button" name="authorsValidate" value="Validate" onClick={show} />
            <Modal
                show={modalShow}
                onHide={hide}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Form noValidate={true}>
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-vcenter">
                            {props.authorsString}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {authorsList}
                        {spinner}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={hide}>Close</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );

}
export default CardNameAuthorsModal;