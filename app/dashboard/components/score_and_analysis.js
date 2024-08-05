import React from 'react';
import { loadContext } from '../context';


const ScoreAnalysis = () => {

    const { KeyWords, Analysis } = loadContext();

    return (
        <div className="w-full p-4 mx-auto bg-white border border-1 border-grey rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-2">Resume Analysis </h2>

            <div className='Scores text-xs'>
                <h3 className="text-lg font-semibold">Scores</h3>
                <br/>
                <p>{KeyWords ? KeyWords.join(', ') : 'No Magic Scan Available'}</p>
            </div>

            <hr className="my-4" />
            <div className='Analysis text-xs whitespace-pre-wrap'>
                <h3 className="text-lg font-semibold">Analysis</h3>
                <br/>
                <p>{Analysis || 'No Magic Scan available'}</p>
            </div>
        </div>
    );
};

export default ScoreAnalysis;