import React, { createContext } from "react";
import { AiracCycles, AiracData } from "ts-aerodata-france";

export const AiracDataContext = createContext<{
  airacData: AiracData;
}>({
  airacData: AiracData.loadCycle(AiracCycles.NOV_04_2021),
});

export const AiracDataProvider: React.FC = ({ children }) => {
  const airacData = AiracData.loadCycle(AiracCycles.NOV_04_2021);
  return (
    <AiracDataContext.Provider value={{ airacData }}>
      {children}
    </AiracDataContext.Provider>
  );
};
