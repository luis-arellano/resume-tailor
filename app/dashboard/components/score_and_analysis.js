import React, { useContext, useEffect, useState } from 'react';
import { FaCheckCircle, FaTimesCircle, FaInfoCircle, FaCoffee, FaBriefcase } from 'react-icons/fa';
import { ModelContext } from '../context';
import apiClient from '@/libs/api';
import ReactMarkdown from 'react-markdown';


const ScoreAnalysis = () => {

    const { selectedModel, latestJobScan, setLatestJobScan, jobScanRefreshKey, jobScanStatus } = useContext(ModelContext);
    const [isLoading, setIsLoading] = useState(false);
    const [matchedKeywords, setMatchedKeywords] = useState([]);
    const [compositeScore, setCompositeScore] = useState(0);
    const [detailedScores, setDetailedScores] = useState([]);
    const [showJobDescription, setShowJobDescription] = useState(false);



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
        if (jobScanStatus !== 'processing') {
            fetchJobScan();
        }
    }, [selectedModel, jobScanRefreshKey, jobScanStatus]);

    useEffect(() => {
        if (latestJobScan && selectedModel) {
            console.log('latestJobScan', latestJobScan);
            const resumeText = JSON.stringify(selectedModel.resume_data).toLowerCase();
            const keywords = latestJobScan.keywords ? latestJobScan.keywords.split(', ') : [];
            const matched = keywords.filter(keyword => resumeText?.includes(keyword.toLowerCase()));
            setMatchedKeywords(matched);

            // Parse detailed scores from job_analysis
            // const scoreRegex = /Score: (\d+)\/5/g;  // worked for gpt-4
            // const scoreRegex = /\*\*Score:?\s*(\d+)\*\*/g;
            const scoreRegex = /(?:Score:?\s*|Score\s*[:-]?\s*)(\d+)(?:\s*\/\s*5|\s*out of\s*5)?/gi;

            const scores = latestJobScan.job_analysis ? 
                [...latestJobScan.job_analysis.matchAll(scoreRegex)].map(match => parseInt(match[1])) : [];
            setDetailedScores(scores);

            // Calculate composite score
            const keywordScore = (matchedKeywords.length / keywords.length) * 100;
            const analysisScore = (scores.reduce((a, b) => a + b, 0) / (scores.length * 5)) * 100;
            const newCompositeScore = Math.round((keywordScore + analysisScore) / 2);
            setCompositeScore(Math.round(newCompositeScore));

            console.log('Scores:', { keywordScore, analysisScore, newCompositeScore, matched, keywords, scores });
        } else {
            setMatchedKeywords([]);
            setCompositeScore(0);
            setDetailedScores([]);
        }
    }, [latestJobScan, selectedModel]);


    if (isLoading || jobScanStatus === 'processing') {
        return (
            <div className="w-full p-4 mx-auto bg-white border border-1 border-grey rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-2">Resume Analysis</h2>
                <div className="flex items-center justify-center h-40">
                    <div className="loading loading-spinner loading-lg"></div>
                </div>
                <p className="text-center">
                    {jobScanStatus === 'processing' ? 'Processing your job scan...' : 'Loading analysis...'}
                </p>
            </div>
        );
    }

    if (jobScanStatus === 'error') {
        return (
            <div className="w-full p-4 mx-auto bg-white border border-1 border-grey rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-2">Resume Analysis</h2>
                <p className="text-center">
                   <span className='text-red-500 bg-red-100 p-2 rounded-lg'> There was an error processing your job scan. Please try again.</span>
                </p>
            </div>
        );
    }

    return (
        <div className="w-full p-4 mx-auto bg-white border border-1 border-grey rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Resume Analysis</h2>
            </div>

            {latestJobScan && (
                <div className="mb-4 ml-4">
                    <div className="flex items-center">
                        <h3 className="text-lg font-semibold">Composite Score</h3>
                        <div className="relative group ml-2">
                            <FaInfoCircle className="text-gray-400 hover:text-gray-600 cursor-pointer" />
                            <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 w-48 z-10 -left-16 top-6">
                                Try to get more than 60 in score for best results.
                            </div>
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-green-600">{compositeScore}</div>
                    <p className="text-sm text-gray-400">
                        Matched {matchedKeywords.length} out of {latestJobScan.keywords ? latestJobScan.keywords.split(', ').length : 0} keywords
                    </p>
                </div>
            )}

            <div className='Scores text-xs'>
                <h3 className="text-lg font-semibold">Scores</h3>
                <br />
                {latestJobScan ? (
                    <div className="ml-4 flex flex-wrap gap-2">
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
                {latestJobScan ? (
                    <div className='bg-gray-100 p-4 rounded-lg'>
                    <ReactMarkdown className='whitespace-pre-wrap'>
                        {latestJobScan.job_analysis || 'No analysis available for this job scan.'}
                    </ReactMarkdown>                    </div>

                ) : (
                    <div className="bg-gray-100 p-4 rounded-lg">
                        <p className="text-gray-600">
                            No analysis available yet. To get an in-depth analysis of your resume:
                        </p>
                        <ol className="list-decimal list-inside mt-2 text-gray-600">
                            <li>Upload or select a resume</li>
                            <li>Paste a job description</li>
                            <li>Click &quot;Magic Resume&quot; to run the analysis</li>
                        </ol>
                    </div>
                )}
            </div>

            <div className="mt-4 text-center text-xs bg-gradient-to-r from-green-100 to-green-200 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <p className="text-sm mb-2 font-semibold text-green-800">If you&apos;re getting value from this, you can show your support:</p>
                <a href="https://buymeacoffee.com/7gdwx9h9vc" target="_blank" rel="noopener noreferrer" className="inline-flex items-center bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition-colors duration-300">
                    <span className="mr-2">Buy me a coffee</span>
                    <FaCoffee className="h-5 w-5 animate-pulse" />
                </a>
            </div>
        </div>
    );
};

export default ScoreAnalysis;