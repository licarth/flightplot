import type { ComponentMeta } from '@storybook/react';
import 'antd/dist/antd.css';
import styled from 'styled-components';
import { AiracData } from 'ts-aerodata-france';
import { FixtureDetails as F } from '~/fb/components/Map/FixtureDetails';
import '../app/styles/global.css';

const FixtureDetails = ({ airacData }: { airacData: AiracData }) => {
    const LFMT = airacData.aerodromes.find(({ icaoCode }) => `${icaoCode}` === 'LFMT')!;
    const LFMT_W = airacData.vfrPoints.find(
        ({ icaoCode, name }) => `${icaoCode}` === 'LFMT' && name === 'W',
    )!;
    const FJR = airacData.vors.find(({ ident }) => `${ident}` === 'FJR')!;
    return (
        <Outer>
            <F fixtures={[LFMT, LFMT_W, FJR]} clickedLocation={LFMT.latLng} onClose={() => {}} />
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

//@ts-ignore
export const Default = (args, { loaded: airacData }) => <FixtureDetails airacData={airacData} />;

Default.loaders = [
    async () => ({
        airacData: await AiracData.loadCurrentCycle(),
    }),
];
