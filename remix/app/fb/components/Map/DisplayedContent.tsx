import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import Modal, { type ModalHandle } from '../../Modal';
import type { LayerEnum } from '../layer/Layer';
import { MyRoutes, RouteWaypoints } from '../Menus';
import { TopBar } from '../TopBar/TopBar';
import { useRoute } from '../useRoute';
import { VerticalProfileChart } from '../VerticalProfileChart';
import { H2 } from './H2';
import { LeafletMapContainer } from './LeafletMapContainer.client';
import { LeftMenu } from './LeftMenu';
import { useMainMap } from './MainMapContext';

export type DisplayedLayers = {
    [keys in LayerEnum]: boolean;
};

type LeafletMapProps = {};

export type MapBounds = [number, number, number, number];

type Section = 'routes' | 'waypoints' | 'print-options' | undefined;

export const DisplayedContent = ({}: LeafletMapProps) => {
    const { setMap } = useMainMap();
    const { route } = useRoute();
    const [mounted, setMounted] = React.useState(false);
    const [expandedSection, setExpandedSection] = useState<Section>();
    const toggleExpandedSection = (section: Section) => {
        expandedSection === section
            ? setExpandedSection(() => undefined)
            : setExpandedSection(section);
    };
    React.useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <>
            <BackgroundContainer onContextMenu={(e) => e.preventDefault()}>
                <TopBar />
                <AppBody>
                    <LeftMenu />
                    <RightSide>
                        {mounted ? <LeafletMapContainer setMap={setMap} /> : <></>}
                        {/* @ts-ignore */}
                        {route?.length > 0 && <VerticalProfile />}
                        <MobileComponents>
                            <H2 onClick={() => toggleExpandedSection('routes')}>MES NAVIGATIONS</H2>
                            <MyRoutes collapsed={expandedSection !== 'routes'} />
                            {route && (
                                <>
                                    <H2 onClick={() => toggleExpandedSection('waypoints')}>
                                        POINTS TOURNANTS
                                    </H2>
                                    <RouteWaypoints collapsed={expandedSection !== 'waypoints'} />
                                </>
                            )}
                        </MobileComponents>
                    </RightSide>
                </AppBody>
            </BackgroundContainer>
        </>
    );
};

const VerticalProfile = () => {
    const vpModal = useRef<ModalHandle>(null);
    const [collapsed, setCollapsed] = useState(true);

    return (
        <>
            <H2 onClick={() => setCollapsed((v) => !v)}>PROFIL VERTICAL</H2>
            <VerticalProfileDiv onClick={() => vpModal.current?.open()} collapsed={collapsed}>
                <VerticalProfileChart />
            </VerticalProfileDiv>
            <Modal fade={false} defaultOpened={false} ref={vpModal}>
                <VerticalProfileModalDiv>
                    <VerticalProfileChart />
                </VerticalProfileModalDiv>
            </Modal>
        </>
    );
};

const RightSide = styled.div`
    display: flex;
    flex-direction: column;
    align-items: stretch;
    flex-grow: 1;
`;

const MobileComponents = styled.div`
    @media (min-width: 1024px) {
        & {
            display: none;
        }
    }
`;

const BackgroundContainer = styled.div`
    display: flex;
    /* flex-grow: 1 0 auto; */
    align-content: stretch;
    align-items: stretch;
    flex-direction: column;
    height: 100%;
`;

const VerticalProfileDiv = styled.div<{ collapsed?: boolean }>`
    height: ${({ collapsed }) => (collapsed ? '0px' : '300px')};
    background-color: white;
    overflow: hidden;
    canvas {
        width: 100% !important;
    }
`;

const VerticalProfileModalDiv = styled.div`
    width: 80vw;
    height: 80vh;
    z-index: 10000;

    @media print {
        width: 100%;
        height: 100%;
    }
`;

const AppBody = styled.div`
    display: flex;
    align-items: stretch;
    flex-grow: 1;
`;
