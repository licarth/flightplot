import { Cycle } from 'airac-cc';
import _ from 'lodash';
import type { PropsWithChildren } from 'react';
import React, { createContext, useEffect, useState } from 'react';
import { AiracData } from 'ts-aerodata-france';

type CycleInfo = {
    uri: string;
    date: string;
    cycle: Cycle;
};

export const AiracDataContext = createContext<{
    airacData?: AiracData;
    availableCycles: CycleInfo[];
    setCycle: (cycleIdentifier: string) => void;
}>({
    availableCycles: [],
    setCycle: () => {},
});

export const AiracDataProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [airacData, setAiracData] = useState<AiracData>();
    const [availableCycles, setAvailableCycles] = useState<CycleInfo[]>([]);

    useEffect(() => {
        const cycleDate = AiracData.currentCycleDate();
        fetchCycle(cycleDate, setAiracData);
    }, []);

    useEffect(() => {
        fetch(
            'https://storage.googleapis.com/storage/v1/b/flightplot-data/o/?prefix=aerodata/',
        ).then((res) =>
            res.json().then((data) => {
                setAvailableCycles(
                    data.items.map((item: any) => {
                        const dateString = _.last((item.name as string).split('/'))?.split('.')[0]!;
                        return {
                            uri: item.mediaLink,
                            date: dateString,
                            cycle: Cycle.fromDate(new Date(dateString)),
                        };
                    }),
                );
            }),
        );
    }, []);

    const setCycle = (cycleIdentifier: string) => {
        const cycleInfo = availableCycles.find((c) => c.cycle.identifier === cycleIdentifier);
        if (cycleInfo) {
            setAiracData(undefined);
            fetchCycle(cycleInfo.date, setAiracData);
        } else {
            console.error(`Cycle ${cycleIdentifier} not found`);
        }
    };

    return (
        <AiracDataContext.Provider value={{ airacData, availableCycles, setCycle }}>
            {children}
        </AiracDataContext.Provider>
    );
};

const fetchCycle = (
    cycleDate: string,
    callback: React.Dispatch<React.SetStateAction<AiracData | undefined>>,
) => {
    fetch(`https://storage.googleapis.com/flightplot-data/aerodata/${cycleDate}.json`).then((res) =>
        res.text().then((text) => {
            return AiracData.loadCycle(JSON.parse(text)).then((data) => {
                callback(data);
            });
        }),
    );
};
