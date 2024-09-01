import React, {useContext, useEffect, useState} from 'react';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { ModelContext } from '../context';
import apiClient from '@/libs/api';


const ScoreAnalysis = () => {

    const {selectedModel, latestJobScan, setLatestJobScan, jobScanRefreshKey } = useContext(ModelContext);
    const [isLoading, setIsLoading] = useState(false);
    const [matchedKeywords, setMatchedKeywords] = useState([]);


    useEffect(() => {
        const fetchJobScan = async () => {
            console.log('Fetching job scan for resume:', selectedModel?.id);
            if (!selectedModel) return;

            setIsLoading(true);
            try {
                const response = await apiClient.get(`/resume/get_latest_scan?resumeId=${selectedModel.id}`);
                console.log('Job scan response:', response);
                setLatestJobScan(response);
            } catch (error) {
                console.error('Error fetching job scan:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchJobScan();
    }, [selectedModel, jobScanRefreshKey]);

    useEffect(() => {
        if (latestJobScan && selectedModel) {
            console.log('latestJobScan:', selectedModel);
            const resumeText = JSON.stringify(selectedModel.resume_data).toLowerCase();
            const keywords = latestJobScan.keywords ? latestJobScan.keywords.split(', ') : [];
            const matched = keywords.filter(keyword => resumeText?.includes(keyword.toLowerCase()));
            setMatchedKeywords(matched);
        } else {
            setMatchedKeywords([]);
        }
    }, [latestJobScan, selectedModel]);

    if (isLoading) {
        return <div>Loading job scan...</div>;
    }

    if (!latestJobScan) {
        return <div>No job scan available</div>;
    }

    const keywords = latestJobScan.keywords ? latestJobScan.keywords.split(', ') : [];

    return (
        <div className="w-full p-4 mx-auto bg-white border border-1 border-grey rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-2">Resume Analysis </h2>

            <div className='Scores text-xs'>
                <h3 className="text-lg font-semibold">Scores</h3>
                <br/>
                {/* <p>{keywords.length > 0 ? keywords.join(', ') : 'No keywords available'}</p> */}
                <div className="flex flex-wrap gap-2">
                    {latestJobScan.keywords ? latestJobScan.keywords.split(', ').map((keyword, index) => (
                        <div key={index} className="flex items-center">
                            {matchedKeywords.includes(keyword) ? (
                                <FaCheckCircle className="text-green-500 mr-1" />
                            ) : (
                                <FaTimesCircle className="text-red-500 mr-1" />
                            )}
                            <span>{keyword}</span>
                        </div>
                    )) : 'No keywords available'}
                </div>
            </div>

            <hr className="my-4" />
            <div className='Analysis text-xs whitespace-pre-wrap'>
                <h3 className="text-lg font-semibold">Analysis</h3>
                <br/>
                <p>{latestJobScan.job_analysis || 'No Magic Scan available'}</p>
            </div>
        </div>
    );
};

export default ScoreAnalysis;