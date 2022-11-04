/* eslint-disable jsx-a11y/anchor-has-content */
import _ from 'lodash';
import { NotionRenderer } from 'react-notion-x';
import styled from 'styled-components';

export type SetPageId = (pageId: string) => void;

export const NotionPart = ({ recordMap, setPageId }: { recordMap: any; setPageId: SetPageId }) => {
    return recordMap ? (
        <NotionContainer>
            <NotionRenderer
                recordMap={recordMap}
                fullPage={true}
                previewImages={true}
                components={{
                    PageLink: (props: any) => (
                        <a
                            {...props}
                            href={null}
                            onClick={() => {
                                setPageId(props.href);
                            }}
                        />
                    ),
                    Link: (props: any) => (
                        <a
                            {...props}
                            href={null}
                            onClick={() => {
                                setPageId(props.href);
                            }}
                        />
                    ),
                }}
                mapPageUrl={_.identity}
                isImageZoomable={false}
            />
        </NotionContainer>
    ) : null;
};

const NotionContainer = styled.div`
    .notion-page-icon-hero.notion-page-icon-span {
        display: none;
    }
`;
