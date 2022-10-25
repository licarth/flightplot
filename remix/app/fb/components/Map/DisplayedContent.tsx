import { Drawer } from 'antd';
import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import Modal, { type ModalHandle } from '../../Modal';
import { useHelpPage } from '../HelpPageContext';
import type { LayerEnum } from '../layer/Layer';
import { MyRoutes, RouteWaypoints } from '../Menus';
import { NotionPage } from '../Notion';
import { TopBar } from '../TopBar/TopBar';
import { useRoute } from '../useRoute';
import { VerticalProfileChartWithHook } from '../VerticalProfileChart';
import { H2 } from './H2';
import { LeafletMapContainer } from './LeafletMapContainer.client';
import { LeftMenu } from './LeftMenu';

export type DisplayedLayers = {
    [keys in LayerEnum]: boolean;
};

type LeafletMapProps = {};

export type MapBounds = [number, number, number, number];

type Section = 'routes' | 'waypoints' | 'print-options' | undefined;

export const DisplayedContent = ({}: LeafletMapProps) => {
    const { route } = useRoute();
    const [mounted, setMounted] = React.useState(false);
    const [expandedSection, setExpandedSection] = useState<Section>();
    const toggleExpandedSection = (section: Section) => {
        expandedSection === section
            ? setExpandedSection(() => undefined)
            : setExpandedSection(section);
    };
    const {
        setPageId: setHelpPageId,
        pageId: helpPageId,
        close,
        isOpen: isHelpOpen,
    } = useHelpPage();
    React.useEffect(() => {
        setMounted(true);
        setHelpPageId('0e2ee51bb50c436796dbb845f9aecc48');
    }, []);

    return (
        <>
            <StyledDrawer
                placement="right"
                open={isHelpOpen}
                width={600}
                onClose={() => close()}
                mask={false}
            >
                <NotionPage pageId={helpPageId} setPageId={setHelpPageId} />
            </StyledDrawer>
            <BackgroundContainer onContextMenu={(e) => e.preventDefault()}>
                <TopBar />
                <AppBody>
                    <RightSide>
                        <LeftMenu />
                        {mounted ? <LeafletMapContainer /> : <></>}
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
                <VerticalProfileChartWithHook />
            </VerticalProfileDiv>
            <Modal fade={false} defaultOpened={false} ref={vpModal}>
                <VerticalProfileModalDiv>
                    <VerticalProfileChartWithHook />
                </VerticalProfileModalDiv>
            </Modal>
        </>
    );
};

const RightSide = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    overflow-y: hidden;
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

const StyledDrawer = styled(Drawer)`
    z-index: 1001;
    .ant-drawer-body {
        padding: 0;
    }
`;
