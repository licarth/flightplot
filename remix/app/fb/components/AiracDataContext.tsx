import type { PropsWithChildren } from 'react';
import React, { createContext, useEffect, useState } from 'react';
import { AiracData } from 'ts-aerodata-france';
import currentCycle from 'ts-aerodata-france/build/jsonData/2022-10-06.json';

export const AiracDataContext = createContext<{
    airacData?: AiracData;
}>({});

export const AiracDataProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [airacData, setAiracData] = useState<AiracData>();

    useEffect(() => {
        AiracData.loadCycle(currentCycle).then((data) => {
            console.log(data.aerodromes.length);
            setAiracData(data);
        });
    }, []);

    return <AiracDataContext.Provider value={{ airacData }}>{children}</AiracDataContext.Provider>;
};
