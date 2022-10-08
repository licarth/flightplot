import type { ComponentMeta, ComponentStory } from '@storybook/react';
import 'antd/dist/antd.css';
import styled from 'styled-components';
import { AiracCycles, AiracData } from 'ts-aerodata-france';
import { FixtureDetails as F } from '~/fb/components/Map/FixtureDetails';
import '../app/styles/global.css';

const airacData = AiracData.loadCycle(AiracCycles.SEP_08_2022);

const FixtureDetails = () => {
    return (
        <Outer>
            <F
                fixture={airacData.aerodromes.find(({ icaoCode }) => `${icaoCode}` === 'LFMT')!}
                onClose={() => {}}
            />
        </Outer>
    );
};

const Outer = styled.div`
    display: flex;
    flex-direction: column;
    max-height: 300px;
    overflow: hidden;
    border: red solid 1px;
`;

export default {
    title: 'Example/FixtureDetails',
    component: FixtureDetails,
    argTypes: {},
} as ComponentMeta<typeof FixtureDetails>;

const Template: ComponentStory<typeof FixtureDetails> = (args) => {
    return <FixtureDetails />;
};

export const Default = Template.bind({});
