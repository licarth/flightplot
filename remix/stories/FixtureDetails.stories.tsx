import type { ComponentMeta } from '@storybook/react';
import 'antd/dist/antd.variable.css';
import { useEffect } from 'react';

import { AiracData } from 'ts-aerodata-france';
import currentCycle from 'ts-aerodata-france/build/jsonData/2023-03-23.json';
import { AiracDataProvider } from '~/fb/components/AiracDataContext';
import { FixtureDetailsWindow } from '~/fb/components/FixtureDetails/FixtureDetailsWindow';
import { HelpPageProvider } from '~/fb/components/HelpPageContext';
import { FixtureFocusProvider, useFixtureFocus } from '~/fb/components/Map/FixtureFocusContext';
import { SearcheableElementProvider } from '~/fb/components/SearchItemContext';
import '../app/styles/global.css';

const FixtureDetails = ({ airacData }: { airacData: AiracData }) => {
    const LFMT = airacData.aerodromes.find(({ icaoCode }) => `${icaoCode}` === 'LFMT')!;
    const LFMT_W = airacData.vfrPoints.find(
        ({ icaoCode, name }) => `${icaoCode}` === 'LFMT' && name === 'W',
    )!;
    const FJR = airacData.vors.find(({ ident }) => `${ident}` === 'FJR')!;

    const { setClickedLocation } = useFixtureFocus();

    useEffect(() => {
        setClickedLocation(LFMT.latLng);
    }, []);

    //  fixtures={[LFMT, LFMT_W, FJR]} clickedLocation={LFMT.latLng} onClose={() => {}}
    return (
        // <Outer>
        <FixtureDetailsWindow />
    );
};

export default {
    title: 'Example/FixtureDetails',
    component: FixtureDetailsWindow,
    argTypes: {},
    decorators: [
        (Story) => (
            <AiracDataProvider>
                <SearcheableElementProvider>
                    <HelpPageProvider>
                        <FixtureFocusProvider>
                            <Story />
                        </FixtureFocusProvider>
                    </HelpPageProvider>
                </SearcheableElementProvider>
            </AiracDataProvider>
        ),
    ],
} as ComponentMeta<typeof FixtureDetailsWindow>;

//@ts-ignore
export const A = (args, { loaded: { airacData } }) => <FixtureDetails airacData={airacData} />;

A.loaders = [
    async () => ({
        airacData: await AiracData.loadCycle(currentCycle),
    }),
];
