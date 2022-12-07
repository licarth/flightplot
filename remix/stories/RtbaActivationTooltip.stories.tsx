import type { ComponentMeta } from '@storybook/react';
import 'antd/dist/antd.variable.css';
import styled from 'styled-components';
import { AiracData } from 'ts-aerodata-france';
import currentCycle from 'ts-aerodata-france/build/jsonData/2022-10-06.json';
import { RtbaActivationTooltip } from '~/fb/components/Map/RtbaActivationTooltip';

import '../app/styles/global.css';

export default {
    title: 'Example/RtbaActivationTooltip',
    component: RtbaActivationTooltip,
    argTypes: {},
} as ComponentMeta<typeof RtbaActivationTooltip>;

//@ts-ignore
export const Default = (args, { loaded: { airacData } }) => {
    return (
        <Background>
            <RtbaActivationTooltip
                //@ts-ignore
                airspace={airacData.dangerZones.filter(({ name }) => name === 'R 45 B')[0]}
            />
            <RtbaActivationTooltip
                //@ts-ignore
                airspace={airacData.dangerZones.filter(({ name }) => name === 'R 45 S7')[0]}
            />
            <RtbaActivationTooltip
                //@ts-ignore
                airspace={airacData.dangerZones.filter(({ name }) => name === 'R 69')[0]}
            />
        </Background>
    );
};

Default.loaders = [
    async () => ({
        airacData: await AiracData.loadCycle(currentCycle),
    }),
];

const Background = styled.div`
    display: flex;
    gap: 17px;
    background: #734500b4;
`;
