import { useLoaderData } from '@remix-run/react';
import { NotionRenderer } from 'react-notion';
import stylesUrl from 'react-notion/src/styles.css';
import type { LinksFunction, LoaderFunction } from 'remix';
import styled from 'styled-components';

export const links: LinksFunction = () => {
    return [
        {
            rel: 'stylesheet',
            href: stylesUrl,
        },
    ];
};

export const loader: LoaderFunction = async ({ params }) => {
    const data = await fetch(
        // 'https://notion-api.splitbee.io/v1/page/d2cabe0b1d1942bb87e5b05cfdf34a26',
        `https://notion-api.splitbee.io/v1/page/${params.pageUuid}`,
    ).then((res) => res.json());

    return {
        blockMap: data,
    };
};

const ExamplePage = () => {
    const { blockMap } = useLoaderData();
    return (
        !!blockMap && (
            <NotionContainer>
                <NotionRenderer
                    blockMap={blockMap}
                    fullPage
                    hideHeader
                    mapPageUrl={(pageId) => `${pageId}`}
                />
            </NotionContainer>
        )
    );
};

const NotionContainer = styled.div`
    max-width: 800px;
`;

export default ExamplePage;
