import { Tag, Tooltip } from 'antd';
import styled from 'styled-components';
import { useAiracData } from '../useAiracData';

export const AiracDataInfo = () => {
    const { airacData } = useAiracData();

    const c = airacData?.cycle;

    const isValidToday = c ? todayIsBetween(c.effectiveStart, c.effectiveEnd) : false;
    const color = isValidToday ? 'green' : 'red';
    return c ? (
        <Container>
            <span>
                <Tooltip
                    title={`valide du ${c.effectiveStart.toLocaleDateString(
                        'fr-FR',
                    )} au ${c.effectiveEnd.toLocaleDateString('fr-FR')}`}
                    color={color}
                >
                    <Tag color={color}>
                        {isValidToday ? '✅' : '❗️'} AIRAC {c.identifier}
                        {!isValidToday && ' expiré'}
                    </Tag>
                </Tooltip>
            </span>
        </Container>
    ) : null;
};

const todayIsBetween = (start: Date, end: Date) => {
    return start <= new Date() && new Date() <= end;
};

const Container = styled.div`
    padding: 4px;
    @media (max-width: 600px) {
        display: none;
    }
`;
