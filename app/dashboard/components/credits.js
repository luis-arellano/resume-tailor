// CreditsDisplay.js
import { useState, useEffect, useContext } from 'react';
import { faCoins } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ModelContext } from "../context";


const Credits = () => {
  const { credits } = useContext(ModelContext);

    return (
        <div className="credits-container">
            <FontAwesomeIcon icon={faCoins} className="coins-icon mr-2" />
            <span className="credits-amount text-xs">{credits} Credits</span>
        </div>
    );
};

export default Credits;