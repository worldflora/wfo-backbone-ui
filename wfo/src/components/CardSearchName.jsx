import React from "react";
import Card from "react-bootstrap/Card";
import Badge from "react-bootstrap/Badge";

function CardSearchName(props) {

    const { name, index, distances } = props;

    //const distances = data.getNamesByStringMatch.distances;

    // what is the state of this name?
    let placement = null;
    let border = "secondary";

    if (name.taxonPlacement) {

        let familyLink = "";
        if (name.taxonPlacement.family) {
            familyLink = getNameLink(name.taxonPlacement.family.acceptedName.fullNameString, name.taxonPlacement.family.acceptedName.wfo);
        }

        let orderLink = "";
        if (name.taxonPlacement.order) {
            orderLink = getNameLink(name.taxonPlacement.order.acceptedName.fullNameString, name.taxonPlacement.order.acceptedName.wfo);
        }

        if (name.taxonPlacement.acceptedName.wfo === name.wfo) {
            placement = <span>Accepted taxon name.
                {" "} [{familyLink}{", "}{orderLink}]
            </span>;
            border = "success";
        } else {
            let accepted = name.taxonPlacement.acceptedName;
            placement = <span>
                A synonym of {' '}
                {getNameLink(accepted.fullNameString, accepted.wfo)}
                {" "} [{familyLink}{", "}{orderLink}]
            </span>
        }
    } else {
        if (name.status === 'deprecated') {
            border = "danger";
            placement = <span>Deprecated name. Do not use.</span>;
        } else {
            border = "primary";
            if (name.status) {
                placement = <span>This name has not been placed in taxonomy. Nomenclatural status: {name.status}</span>;
            } else {
                placement = <span>This name has not been placed in taxonomy. The nomenclatural status has not been set.</span>;
            }
            placement = <span>This name has not been placed in taxonomy.</span>;
        }
    }


    function getNameLink(nameString, wfo) {
        return < a href={"#" + wfo} onClick={(e) => { e.preventDefault(); window.location.hash = wfo; }} dangerouslySetInnerHTML={{ __html: nameString }} />
    }


    return (
        <Card border={border} style={{ marginBottom: '0.5em' }}>
            <Card.Body>
                <Card.Text>
                    <p>
                        <Badge pill variant="secondary">{distances[index]}</Badge>{" "}
                        {getNameLink(name.fullNameString, name.wfo)}
                        {" "}
                        {placement}
                    </p>
                </Card.Text>
            </Card.Body>
        </Card>
    );


}
export default CardSearchName