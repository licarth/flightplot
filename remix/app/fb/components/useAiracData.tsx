import { useContext } from 'react';
import { AiracDataContext } from './AiracDataContext';

export const useAiracData = () => {
    const { airacData, availableCycles, setCycle } = useContext(AiracDataContext);
    if (!airacData) {
        return { airacData, availableCycles, setCycle, loading: true } as const;
    } else {
        return { airacData, availableCycles, setCycle, loading: false } as const;
    }
};
