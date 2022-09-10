// import '../fb/firebaseConfig';
import { useState } from 'react';
import { MetaFunction } from 'remix';
import styled from 'styled-components';
import { DisplayedContent, PrintContent } from '~/fb/components/Map';
import { MainMapProvider } from '~/fb/components/Map/MainMapContext';
import { PrintPreview } from '~/fb/components/Map/PrintPreview';
import { AiracDataProvider } from '../fb/components/AiracDataContext';
import { LayerEnum } from '../fb/components/layer/Layer';
import { PrintProvider } from '../fb/components/PrintContext';
import { RouteProvider } from '../fb/components/RouteContext';
import { UserRoutesProvider } from '../fb/components/UserRoutesContext';
import { FirebaseAuthProvider } from '../fb/firebase/auth/FirebaseAuthContext';

export default function Index() {
    const [displayedLayers] = useState<DisplayedLayers>({
        icao: true,
        open_street_map: false,
    });

    return (
        <FirebaseAuthProvider>
            <AiracDataProvider>
                <UserRoutesProvider>
                    <RouteProvider>
                        <PrintProvider>
                            <div id="modal-root" data-testid="modal-root"></div>
                            <AppContainer id="app">
                                <MainMapProvider>
                                    <DisplayedContent displayedLayers={displayedLayers} />
                                </MainMapProvider>
                            </AppContainer>
                            <PrintContent>{''}</PrintContent>
                            <PrintPreview />
                        </PrintProvider>
                    </RouteProvider>
                </UserRoutesProvider>
            </AiracDataProvider>
        </FirebaseAuthProvider>
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
