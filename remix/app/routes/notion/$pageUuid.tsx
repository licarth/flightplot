import type { LinksFunction, LoaderFunction } from '@remix-run/server-runtime';
import stylesUrl from 'react-notion-x/src/styles.css';

export const links: LinksFunction = () => {
    return [
        {
            rel: 'stylesheet',
            href: stylesUrl,
        },
    ];
};

export const loader: LoaderFunction = async ({ params }) => {
    const { NotionAPI } = await import('notion-client');
    const notion = new NotionAPI();
    const recordMap = await notion.getPage(`${params.pageUuid}`);
    return {
        recordMap,
    };
};
