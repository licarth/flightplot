import type { MetaFunction } from '@remix-run/node';
import andtStyles from 'antd/dist/antd.css';
import leafletStyles from 'leaflet/dist/leaflet.css';

import FullStory from 'react-fullstory';
import styled from 'styled-components';
import { HelpPageProvider } from '~/fb/components/HelpPageContext';
import { DisplayedContent, PrintContent } from '~/fb/components/Map';
import { FixtureFocusProvider } from '~/fb/components/Map/FixtureFocusContext';
import { MainMapProvider } from '~/fb/components/Map/MainMapContext';
import { PrintPreview } from '~/fb/components/Map/PrintPreview';
import { TemporaryMapBoundsProvider } from '~/fb/components/Map/TemporaryMapCenterContext';
import { MouseModeProvider } from '~/fb/components/MouseModeContext';
import { SearcheableElementProvider } from '~/fb/components/SearchItemContext';
import { environmentVariable } from '~/fb/environmentVariable';
import { AiracDataProvider } from '../fb/components/AiracDataContext';
import type { LayerEnum } from '../fb/components/layer/Layer';
import { PrintProvider } from '../fb/components/PrintContext';
import { RouteProvider } from '../fb/components/RouteContext';
import { UserRoutesProvider } from '../fb/components/UserRoutesContext';
import { FirebaseAuthProvider } from '../fb/firebase/auth/FirebaseAuthContext';

export const links = () => [
    { rel: 'stylesheet', href: andtStyles },
    { rel: 'stylesheet', href: leafletStyles },
];

export default () => {
    const fullstoryOrgId = environmentVariable('PUBLIC_FULLSTORY_ORG_ID');
    return (
        <>
            <HelpPageProvider>
                {fullstoryOrgId && <FullStory org={fullstoryOrgId} />}
                <FirebaseAuthProvider>
                    <AiracDataProvider>
                        <UserRoutesProvider>
                            <RouteProvider>
                                <FixtureFocusProvider>
                                    <SearcheableElementProvider>
                                        <PrintProvider>
                                            <div id="modal-root" data-testid="modal-root"></div>
                                            <AppContainer id="app">
                                                <MouseModeProvider>
                                                    <MainMapProvider>
                                                        <TemporaryMapBoundsProvider>
                                                            <DisplayedContent />
                                                        </TemporaryMapBoundsProvider>
                                                    </MainMapProvider>
                                                </MouseModeProvider>
                                            </AppContainer>
                                            <PrintContent>{''}</PrintContent>
                                            <PrintPreview />
                                        </PrintProvider>
                                    </SearcheableElementProvider>
                                </FixtureFocusProvider>
                            </RouteProvider>
                        </UserRoutesProvider>
                    </AiracDataProvider>
                </FirebaseAuthProvider>
            </HelpPageProvider>
        </>
    );
};

export const meta: MetaFunction = () => {
    return {
        title: 'FlightPlot',
        description: 'Outil de plannification de vols VFR',
        viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
    };
};

export type DisplayedLayers = {
    [keys in LayerEnum]: boolean;
};

const AppContainer = styled.div`
    height: 100%;
`;
