import React, { useContext, useEffect, useState } from 'react';
import { FaCheckCircle, FaTimesCircle, FaInfoCircle } from 'react-icons/fa';
import { ModelContext } from '../context';
import apiClient from '@/libs/api';


const ScoreAnalysis = () => {

    const { selectedModel, latestJobScan, setLatestJobScan, jobScanRefreshKey } = useContext(ModelContext);
    const [isLoading, setIsLoading] = useState(false);
    const [matchedKeywords, setMatchedKeywords] = useState([]);


    useEffect(() => {
        const fetchJobScan = async () => {
            if (!selectedModel) return;

            setIsLoading(true);
            try {
                const response = await apiClient.get(`/resume/get_latest_scan?resumeId=${selectedModel.id}`);
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
        return <div className="w-full p-4 mx-auto bg-white border border-1 border-grey rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-2">Resume Analysis</h2>
            <div className="flex items-center justify-center h-40">
                <div className="loading loading-spinner loading-lg"></div>
            </div>
        </div>;
    }

    return (
        <div className="w-full p-4 mx-auto bg-white border border-1 border-grey rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-2">Resume Analysis </h2>

            <div className='Scores text-xs'>
                <h3 className="text-lg font-semibold">Scores</h3>
                <br />
                {latestJobScan ? (
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
                ) : (
                    <div className="flex items-center text-gray-500">
                        <FaInfoCircle className="mr-2" />
                        <p>No job scan available. Run a Magic Resume scan to see keyword matches.</p>
                    </div>
                )}

            </div>

            <hr className="my-4" />
            <div className='Analysis text-xs'>
                <h3 className="text-lg font-semibold">Analysis</h3>
                <br />
                {/* <p>{latestJobScan.job_analysis || 'No Magic Scan available'}</p> */}
                {latestJobScan ? (
                    <p className='whitespace-pre-wrap'>{latestJobScan.job_analysis || 'No analysis available for this job scan.'}</p>
                ) : (
                    <div className="bg-gray-100 p-4 rounded-lg">
                        <p className="text-gray-600">
                            No analysis available yet. To get an in-depth analysis of your resume:
                        </p>
                        <ol className="list-decimal list-inside mt-2 text-gray-600">
                            <li>Upload or select a resume</li>
                            <li>Paste a job description</li>
                            <li>Click "Magic Resume" to run the analysis</li>
                        </ol>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScoreAnalysis;