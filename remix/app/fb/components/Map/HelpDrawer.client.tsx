import { Drawer } from 'antd';
import React from 'react';
import styled from 'styled-components';
import { NotionPage } from '../Notion';

export const HelpDrawer: React.FC<{
    close: () => void;
    helpPageId?: string;
    isHelpOpen: boolean;
    setHelpPageId: (pageId: string) => void;
}> = ({ close, helpPageId, isHelpOpen, setHelpPageId }) => {
    return (
        <StyledDrawer
            placement="right"
            open={isHelpOpen}
            width={window.innerWidth < 600 ? window.innerWidth : 600}
            onClose={() => close()}
            mask={false}
        >
            <NotionPage pageId={helpPageId} setPageId={setHelpPageId} />
        </StyledDrawer>
    );
};

const StyledDrawer = styled(Drawer)`
    z-index: 1001;
    .ant-drawer-body {
        padding: 0;
    }
`;
