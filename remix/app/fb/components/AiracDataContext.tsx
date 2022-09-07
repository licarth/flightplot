import React, { createContext, PropsWithChildren } from 'react';
import { AiracCycles, AiracData } from 'ts-aerodata-france';

export const AiracDataContext = createContext<{
    airacData: AiracData;
}>({
    airacData: AiracData.loadCycle(AiracCycles.AUG_11_2022),
});

export const AiracDataProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const airacData = AiracData.loadCycle(AiracCycles.AUG_11_2022);
    return <AiracDataContext.Provider value={{ airacData }}>{children}</AiracDataContext.Provider>;
};
