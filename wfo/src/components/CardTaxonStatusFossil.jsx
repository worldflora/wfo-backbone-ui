import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import { useMutation, useQuery, gql } from "@apollo/client";

const FOSSIL_QUERY = gql`
   query getFossilStatus($wfo: String!){
        getNameForWfoId(id: $wfo){
            id,
            canEdit,
            wfo,
            taxonPlacement{
                id,
                isFossil,
                acceptedName{
                    id,
                    wfo
                }
            }
        }
    }
`;

const UPDATE_FOSSIL = gql`
        mutation  updateFossilStatus(
            $id: Int!,
            $isFossil: Boolean!
            ){
          updateFossilStatus(
              id: $id,
              isFossil: $isFossil
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

function CardTaxonStatusFossil(props) {

    const [isFossil, setFossilStatus] = useState(false);
    const [wfo, setWfo] = useState('');

    const { data } = useQuery(FOSSIL_QUERY, {
        variables: { wfo: props.wfo }
    });

    const [updateFossilStatus, { loading: updateLoading }] = useMutation(UPDATE_FOSSIL, {
        refetchQueries: [
            'getHeaderInfo',
            'getChildren'
        ],
        update(cache) {
            cache.modify({
                id: cache.identify(name.taxonPlacement),
                fields: {
                    isFossil(cachedVal) {
                        // just toggle it
                        return !cachedVal;
                    }
                }
            });
        }
    });


    let name = data ? data.getNameForWfoId : null;

    // if we don't have a name then don't render at all
    if (!name) return null;

    // can we edit?
    if (!name.canEdit) return null;

    // if the wfo has changed then update our default state
    if (name && wfo !== props.wfo) {
        setWfo(props.wfo);
    }


    if (name.taxonPlacement && name.taxonPlacement.acceptedName.id === name.id) {
        // we are this taxon so it is appropriate
        if (isFossil !== name.taxonPlacement.isFossil) setFossilStatus(name.taxonPlacement.isFossil);
    } else {
        // not an accepted name so don't display
        return null;
    }



    function handleFossilStatusChange(e) {
        setFossilStatus(e.target.checked);
        updateFossilStatus({
            variables: {
                id: parseInt(name.taxonPlacement.id),
                isFossil: e.target.checked
            }
        });
    }

    let label = null;
    if (updateLoading) {
        label = " Updating... ";
    } else {
        label = isFossil ? <span>Is <strong>fossil</strong> taxon</span> : <span>Check to make this a <strong>fossil</strong> taxon.</span>;
    }

    return (  
        <Form.Group controlId="fossil">
            <Form.Check
                type="checkbox"
                id="fossil"
                label={label}
                onChange={handleFossilStatusChange}
                checked={isFossil}
            />
        </Form.Group>
    );

}
export default CardTaxonStatusFossil;
