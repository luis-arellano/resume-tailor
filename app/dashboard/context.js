// Model Context Provider
"use client";

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import React, { createContext, useContext, useState, useEffect } from 'react';

export const ModelContext = createContext();
export const LoadContext = () => useContext(ModelContext);

export const ModelProvider = ({ children }) => {
    const [selectedModel, setSelectedModel] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [contextLoading, setContextLoading] = useState(true);
    const [KeyWords, setKeyWords] = useState([]);
    const [Analysis, setAnalysis] = useState(null);

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
        setContextLoading(false);
    }

    const updateModel = (newModel) => {
        setSelectedModel(newModel);

    }

    // Used to refresh List Models
    const refreshModels = () => {
        setRefreshKey(prevKey => prevKey + 1);
    }

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
            KeyWords,
            setKeyWords,
            Analysis,
            setAnalysis
        }}>
            {children}
        </ModelContext.Provider>
    );
};