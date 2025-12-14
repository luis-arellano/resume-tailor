// Model Context Provider
"use client";

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '@/libs/api';

export const ModelContext = createContext();
export const LoadContext = () => useContext(ModelContext);

export const ModelProvider = ({ children }) => {
    const [selectedModel, setSelectedModel] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [jobScanRefreshKey, setJobScanRefreshKey] = useState(0);
    const [contextLoading, setContextLoading] = useState(true);
    const [latestJobScan, setLatestJobScan] = useState(null);
    const [jobScanStatus, setJobScanStatus] = useState(null);
    const [credits, setTotalCredits] = useState(0);


    const getUserData = async () => {
        const supabase = createClientComponentClient();
        const {
            data: { session },
        } = await supabase.auth.getSession();

        // Set Selected Resume
        const storedModel = localStorage.getItem(`selectedModel_${session.user.id}`);
        if (storedModel) {
            setSelectedModel(JSON.parse(storedModel));
        }

        // Get User Credits
        const credits_response = await apiClient.get('/credits/get_credits');

        console.log(credits_response);
        // If there is no data, it means the user doesn't have a profile,
        // and needs to first buy credits.
        if(!credits_response) {
            return
        }
        setTotalCredits(credits_response.data || 0);

        // Why is the loading here?
        setContextLoading(false);
    }

    const updateModel = async(newModel) => {
        setSelectedModel(newModel);

        const supabase = createClientComponentClient();
        const {
            data: { session },
        } = await supabase.auth.getSession();

        if (session) {
            if (newModel) {
                localStorage.setItem(`selectedModel_${session.user.id}`, JSON.stringify(newModel));
            } else {
                localStorage.removeItem(`selectedModel_${session.user.id}`);
            }
        }
    }

    // Used to refresh List Resumes
    const refreshModels = () => {
        setRefreshKey(prevKey => prevKey + 1);
    }

    // Used to refresh Job Scans
    const refreshJobScan = () => {
        setJobScanRefreshKey(prevKey => prevKey + 1);
    };

    useEffect(() => {
        // Load the model from localStorage on initial load
        getUserData()
    }, []);

    return (
        <ModelContext.Provider value={{
            selectedModel,
            setSelectedModel,
            refreshModels,
            refreshKey,
            setRefreshKey,
            contextLoading,
            updateModel,
            latestJobScan,
            setLatestJobScan,
            jobScanRefreshKey,
            refreshJobScan,
            jobScanStatus,
            setJobScanStatus,
            credits
        }}>
            {children}
        </ModelContext.Provider>
    );
};