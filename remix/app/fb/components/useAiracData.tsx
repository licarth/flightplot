import { useContext } from 'react';
import type { AiracData } from 'ts-aerodata-france';
import { AiracDataContext } from './AiracDataContext';

export const useAiracData = ():
    | { loading: true; airacData: undefined }
    | { loading: false; airacData: AiracData } => {
    const { airacData } = useContext(AiracDataContext);
    if (!airacData) {
        return { airacData, loading: true };
    } else {
        return { airacData, loading: false };
    }
};
