import { useContext } from 'react';
import { AiracDataContext } from './AiracDataContext';

export const useAiracData = () => {
    const { airacData } = useContext(AiracDataContext);
    return { airacData };
};
