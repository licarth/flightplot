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
import { WeatherProvider } from '~/fb/components/WeatherContext';
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
                        <WeatherProvider>
                            <UserRoutesProvider>
                                <MainMapProvider>
                                    <RouteProvider>
                                        <FixtureFocusProvider>
                                            <SearcheableElementProvider>
                                                <PrintProvider>
                                                    <div
                                                        id="modal-root"
                                                        data-testid="modal-root"
                                                    ></div>
                                                    <AppContainer id="app">
                                                        <MouseModeProvider>
                                                            <TemporaryMapBoundsProvider>
                                                                <DisplayedContent />
                                                            </TemporaryMapBoundsProvider>
                                                        </MouseModeProvider>
                                                    </AppContainer>
                                                    <PrintContent>{''}</PrintContent>
                                                    <PrintPreview />
                                                </PrintProvider>
                                            </SearcheableElementProvider>
                                        </FixtureFocusProvider>
                                    </RouteProvider>
                                </MainMapProvider>
                            </UserRoutesProvider>
                        </WeatherProvider>
                    </AiracDataProvider>
                </FirebaseAuthProvider>
            </HelpPageProvider>
        </>
    );
};

export type DisplayedLayers = {
    [keys in LayerEnum]: boolean;
};

const AppContainer = styled.div`
    height: 100%;
`;
