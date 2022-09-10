import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import Modal, { type ModalHandle } from '../../Modal';
import type { LayerEnum } from '../layer/Layer';
import { TopBar } from '../TopBar/TopBar';
import { VerticalProfileChart } from '../VerticalProfileChart';
import { H2 } from './H2';
import { LeafletMapContainer } from './LeafletMapContainer.client';
import { LeftMenu } from './LeftMenu';
import { useMainMap } from './MainMapContext';

export type DisplayedLayers = {
    [keys in LayerEnum]: boolean;
};

type LeafletMapProps = {
    displayedLayers: DisplayedLayers;
};

export type MapBounds = [number, number, number, number];

export const DisplayedContent = ({ displayedLayers }: LeafletMapProps) => {
    const { setMap } = useMainMap();
    const [mounted, setMounted] = React.useState(false);
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
                        <VerticalProfile />
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
    flex: 1 0 auto;
    justify-content: flex-end;
`;

const BackgroundContainer = styled.div`
    display: flex;
    flex-grow: 1 0 auto;
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
    flex: auto;
`;
