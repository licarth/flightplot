import type { ComponentMeta } from '@storybook/react';
import 'antd/dist/antd.css';
import { AiracData } from 'ts-aerodata-france';
import currentCycle from 'ts-aerodata-france/build/jsonData/2022-10-06.json';
import { AiracDataProvider } from '~/fb/components/AiracDataContext';
import { SearchBar } from '~/fb/components/SearchBar';

import '../app/styles/global.css';

export default {
    title: 'Example/SearchBar',
    component: SearchBar,
    argTypes: {},
} as ComponentMeta<typeof SearchBar>;

//@ts-ignore
export const Default = (args, { loaded: { airacData } }) => {
    return (
        <AiracDataProvider>
            <SearchBar {...args} airacData={airacData} />
        </AiracDataProvider>
    );
};

Default.loaders = [
    async () => ({
        airacData: await AiracData.loadCycle(currentCycle),
    }),
];
