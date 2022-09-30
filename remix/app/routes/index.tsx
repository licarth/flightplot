// import '../fb/firebaseConfig';
import FullStory from 'react-fullstory';
import type { MetaFunction } from 'remix';
import styled from 'styled-components';
import { DisplayedContent, PrintContent } from '~/fb/components/Map';
import { MainMapProvider } from '~/fb/components/Map/MainMapContext';
import { PrintPreview } from '~/fb/components/Map/PrintPreview';
import { AiracDataProvider } from '../fb/components/AiracDataContext';
import type { LayerEnum } from '../fb/components/layer/Layer';
import { PrintProvider } from '../fb/components/PrintContext';
import { RouteProvider } from '../fb/components/RouteContext';
import { UserRoutesProvider } from '../fb/components/UserRoutesContext';
import { FirebaseAuthProvider } from '../fb/firebase/auth/FirebaseAuthContext';

const ORG_ID = 'o-1DMMAY-na1'; // Fill this in here

export default function Index() {
    return (
        <>
            <FullStory org={ORG_ID} />
            <FirebaseAuthProvider>
                <AiracDataProvider>
                    <UserRoutesProvider>
                        <RouteProvider>
                            <PrintProvider>
                                <div id="modal-root" data-testid="modal-root"></div>
                                <AppContainer id="app">
                                    <MainMapProvider>
                                        <DisplayedContent />
                                    </MainMapProvider>
                                </AppContainer>
                                <PrintContent>{''}</PrintContent>
                                <PrintPreview />
                            </PrintProvider>
                        </RouteProvider>
                    </UserRoutesProvider>
                </AiracDataProvider>
            </FirebaseAuthProvider>
        </>
    );
}

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
