import type { ComponentMeta, ComponentStory } from '@storybook/react';
import { Collapse } from 'antd';
import 'antd/dist/antd.variable.css';
import styled from 'styled-components';
import '../app/styles/global.css';

const DrawerContainer = () => {
    return (
        <StyledCollapse defaultActiveKey={['1', '2', '3', '4']}>
            <StyledPanel header="Panel 1 Header" key={'1'}>
                <div>Content</div>
                <div>Content</div>
                <div>Content</div>
                <div>Content</div>
                <div>Content</div>
                <div>Content</div>
                <div>Content</div>
            </StyledPanel>
            <StyledPanel header="Panel 2 Header" key={'2'}>
                <div>Content</div>
            </StyledPanel>
            <StyledPanel header="Panel 3 Header" key={'3'}>
                <div>Content</div>
            </StyledPanel>
            <StyledPanel header="Panel 4 Header" key={'4'}>
                <div>Content</div>
            </StyledPanel>
        </StyledCollapse>
    );
};

const StyledCollapse = styled(Collapse)`
    display: flex;
    flex-direction: column;
    max-height: 500px;
    overflow: hidden;
`;

const StyledPanel = styled(Collapse.Panel)`
    display: flex;
    flex-direction: column;
    flex-shrink: 1;
    overflow: scroll;
    .ant-collapse-content {
        flex-shrink: 1;
        overflow: scroll;
    }
`;

export default {
    title: 'Example/DrawerContainer',
    component: DrawerContainer,
    argTypes: {},
} as ComponentMeta<typeof DrawerContainer>;

const Template: ComponentStory<typeof DrawerContainer> = (args) => {
    return <DrawerContainer />;
};

export const Default = Template.bind({});
