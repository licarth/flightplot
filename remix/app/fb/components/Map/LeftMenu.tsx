import { Button, Collapse } from 'antd';
import styled from 'styled-components';
import { RouteDisplay } from './RouteDisplay';

const Panel = styled(Collapse.Panel)`
    font-family: 'Univers';
`;

const ContainerDiv = styled.div`
    display: none;

    @media (min-width: 1024px) {
        & {
            pointer-events: none;
            height: 100%;
            display: flex;
            min-width: 400px;
            width: 400px;
            position: absolute;
            top: 10px;
            left: 10px;
            z-index: 600;
            filter: drop-shadow(5px 5px 10px #3c3c3c);
        }
    }
`;

export const LeftMenu = () => {
    return (
        <ContainerDiv>
            <LeftColumn>
                <RouteDisplay />
            </LeftColumn>
            {/* @ts-ignore */}
        </ContainerDiv>
    );
};

export const LeftColumn = styled.div`
    pointer-events: none;
    display: flex;
    flex-grow: 1;
    flex-direction: column;
    overflow: hidden;
    border: 1px black;
    max-height: 90%;
`;

export const StyledPanel = styled(Panel)<{ $shrinkable?: boolean }>`
    display: flex;
    flex-direction: column;
    ${({ $shrinkable }) => {
        if ($shrinkable) {
            return `
            overflow: hidden;
            .ant-collapse-header {
                flex-shrink: 0;
            }
            .ant-collapse-content {
                flex-shrink: 1;
                overflow: scroll;
            }`;
        }
    }}
`;

export const Header = styled.div`
    padding: 0px;
`;

export const NewNavButton = styled(Button)`
    margin-bottom: 10px;
    text-align: center;
    height: 30px;
`;

export const StyledCollapse = styled(Collapse)`
    pointer-events: auto;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-radius: 7px;
`;

export const SpinnerContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-top: 3rem;
    margin-bottom: 3rem;
`;
