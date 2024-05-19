// Model Context Provider
"use client";

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from "@/libs/api";

export const ModelContext = createContext();
export const useModel = () => useContext(ModelContext);

export const ModelProvider = ({ children }) => {
    const [selectedModel, setSelectedModel] = useState(null);
    const [credits, setTotalCredits] = useState(0);
    const [refreshKey, setRefreshKey] = useState(0);


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

        // Set User Credits
        const response = await apiClient.get("/supabase/credits");

        // If there is no data, it means the user doesn't have a profile,
        // and needs to first buy credits.
        if(!response) {
            return
        }
        console.log("data: ", response);
        setTotalCredits(response.data || 0);
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
            credits,
            setTotalCredits,
            refreshModels,
            refreshKey
        }}>
            {children}
        </ModelContext.Provider>
    );
};