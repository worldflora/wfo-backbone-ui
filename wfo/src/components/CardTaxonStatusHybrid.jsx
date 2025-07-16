import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import { useMutation, useQuery, gql } from "@apollo/client";

const HYBRID_QUERY = gql`
   query getHybridStatus($wfo: String!){
        getNameForWfoId(id: $wfo){
            id,
            canEdit,
            wfo,
            taxonPlacement{
                id,
                isHybrid,
                acceptedName{
                    id,
                    wfo
                }
            }
        }
    }
`;

const UPDATE_HYBRID = gql`
        mutation  updateHybridStatus(
            $id: Int!,
            $isHybrid: Boolean!
            ){
          updateHybridStatus(
              id: $id,
              isHybrid: $isHybrid
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

function CardTaxonStatusHybrid(props) {

    const [isHybrid, setHybridStatus] = useState(false);
    const [wfo, setWfo] = useState('');

    const { data } = useQuery(HYBRID_QUERY, {
        variables: { wfo: props.wfo }
    });

    const [updateHybridStatus, { loading: updateLoading }] = useMutation(UPDATE_HYBRID, {
        refetchQueries: [
            'getHeaderInfo',
            'getChildren'
        ],
        update(cache) {
            cache.modify({
                id: cache.identify(name.taxonPlacement),
                fields: {
                    isHybrid(cachedVal) {
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
        if (isHybrid !== name.taxonPlacement.isHybrid) setHybridStatus(name.taxonPlacement.isHybrid);
    } else {
        // not an accepted name so don't display
        return null;
    }

    function handleHybridStatusChange(e) {
        setHybridStatus(e.target.checked);
        updateHybridStatus({
            variables: {
                id: parseInt(name.taxonPlacement.id),
                isHybrid: e.target.checked
            }
        });
    }

    let hybridLabel = null;
    if (updateLoading) {
        hybridLabel = " Updating... ";
    } else {
        hybridLabel = isHybrid ? <span>Is <strong>hybrid</strong> taxon</span> : <span>Check to make this a <strong>hybrid</strong> taxon.</span>;;
    }

    return (

        <Form.Group controlId="hybrid">
            <Form.Check
                type="checkbox"
                id="hybrid"
                label={hybridLabel}
                onChange={handleHybridStatusChange}
                checked={isHybrid}
            />
        </Form.Group> 

    );

}
export default CardTaxonStatusHybrid;
