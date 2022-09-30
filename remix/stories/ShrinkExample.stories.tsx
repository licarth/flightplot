import type { ComponentMeta, ComponentStory } from '@storybook/react';
import 'antd/dist/antd.css';
import styled from 'styled-components';
import '../app/styles/global.css';

const ShrinkFlex = () => {
    return (
        <Outer>
            <Inner>
                <div>Content</div>
                <div>Content</div>
                <div>Content</div>
                <div>Content</div>
                <div>Content</div>
                <div>Content</div>
                <div>Content</div>
                <div>Content</div>
                <div>Content</div>
                <div>Content</div>
                <div>Content</div>
                <div>Content</div>
                <div>Content</div>
                <div>Content</div>
            </Inner>
            <Inner>
                <div>Content 2</div>
            </Inner>
            <Inner>
                <div>Content 3</div>
            </Inner>
            <Inner>
                <div>Content 4</div>
            </Inner>
        </Outer>
    );
};

const Outer = styled.div`
    display: flex;
    flex-direction: column;
    max-height: 300px;
    overflow: hidden;
    border: red solid 1px;
`;
const Inner = styled.div`
    border: black solid 1px;
    display: flex;
    flex-direction: column;
    overflow: scroll;
    flex-shrink: 1;
`;

export default {
    title: 'Example/ShrinkFlex',
    component: ShrinkFlex,
    argTypes: {},
} as ComponentMeta<typeof ShrinkFlex>;

const Template: ComponentStory<typeof ShrinkFlex> = (args) => {
    return <ShrinkFlex />;
};

export const Default = Template.bind({});
