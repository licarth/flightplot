import type { PropsWithChildren } from 'react';
import React, { createContext, useContext, useState } from 'react';

type PrintElements = {
    navLog: boolean;
    verticalProfile: boolean;
    charts: boolean;
};

export const FORMATS = {
    A4_LANDSCAPE: { dxMillimeters: 297, dyMillimeters: 210 },
    A4_PORTRAIT: { dxMillimeters: 210, dyMillimeters: 297 },
};
const defaultPrintElements = {
    verticalProfile: true,
    navLog: true,
    charts: false,
};

export const PrintContext = createContext<{
    printElements: PrintElements;
    setPrintElements: React.Dispatch<React.SetStateAction<PrintElements>>;
    chartsLoading: boolean;
    setChartsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}>({
    printElements: defaultPrintElements,
    setPrintElements: () => {},
    chartsLoading: false,
    setChartsLoading: () => {},
});

export const PrintProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [printElements, setPrintElements] = useState<PrintElements>(defaultPrintElements);
    const [chartsLoading, setChartsLoading] = useState<boolean>(false);

    return (
        <PrintContext.Provider
            value={{
                printElements,
                setPrintElements,
                chartsLoading,
                setChartsLoading,
            }}
        >
            {children}
        </PrintContext.Provider>
    );
};

export const usePrint = () => {
    return useContext(PrintContext);
};
