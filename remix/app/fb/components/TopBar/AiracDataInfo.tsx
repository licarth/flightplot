import type { Cycle } from 'airac-cc';
import { Select, Tag, Tooltip } from 'antd';
import _ from 'lodash';
import styled from 'styled-components';
import { useAiracData } from '../useAiracData';

export const AiracDataInfo = () => {
    const { airacData, availableCycles, setCycle } = useAiracData();
    const c = airacData?.cycle;

    return c ? (
        <Container>
            <Select
                defaultValue={c.identifier}
                onSelect={(identifier: string) => setCycle(identifier)}
            >
                {_.sortBy(availableCycles, (o) => -o.cycle.identifier).map(({ cycle }) => (
                    <Select.Option value={cycle.identifier} key={cycle.identifier}>
                        <AiracTag cycle={cycle} />
                    </Select.Option>
                ))}
            </Select>
        </Container>
    ) : null;
};

const AiracTag = ({ cycle: c }: { cycle: Cycle }) => {
    const isValidToday = c ? todayIsBetween(c.effectiveStart, c.effectiveEnd) : false;
    const color = isValidToday ? 'green' : 'orange';

    return (
        <span>
            <Tooltip
                title={`valide du ${c.effectiveStart.toLocaleDateString(
                    'fr-FR',
                )} au ${c.effectiveEnd.toLocaleDateString('fr-FR')}`}
                color={color}
                placement="left"
            >
                <Tag color={color}>
                    {isValidToday ? '✅' : '🔸'} AIRAC {c.identifier}
                </Tag>
            </Tooltip>
        </span>
    );
};

const todayIsBetween = (start: Date, end: Date) => {
    return start <= new Date() && new Date() <= end;
};

const Container = styled.div`
    padding: 4px;
    margin-right: 10px;
    @media (max-width: 600px) {
        display: none;
    }
`;
