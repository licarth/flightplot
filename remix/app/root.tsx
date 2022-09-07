import type { LinksFunction, MetaFunction } from 'remix';
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration, useCatch } from 'remix';
import globablStylesUrl from '~styles/global.css';
import rootStylesUrl from '~styles/index.css';
import normalizeStylesUrl from '~styles/__normalize__.css';
import './fb/firebaseConfig';

export const meta: MetaFunction = () => {
    const description = `Remix startup example`;
    const keywords = `Remix, startup, example`;
    const twitter = {
        'twitter:image': 'https://www.webstep.no/wp-content/uploads/2019/08/WEBSTEP_logo.png',
        'twitter:card': 'summary_large_image',
        'twitter:creator': '@chiangse',
        'twitter:site': '@chiangse',
        'twitter:title': 'Remix startup',
        'twitter:description': description,
    };
    return { title: 'New Remix App', description, keywords, ...twitter };
};

export const links: LinksFunction = () => {
    const stylesheets = [
        'https://unpkg.com/leaflet@1.6.0/dist/leaflet.css',
        'https://use.fontawesome.com/releases/v5.3.1/css/all.css',
        'https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css',
        'https://fonts.googleapis.com/css2?family=Open+Sans:wght@300&family=Russo+One&display=swap',
    ];
    return [
        {
            rel: 'preconnect',
            href: 'https://fonts.googleapis.com',
        },
        {
            rel: 'preconnect',
            href: 'https://fonts.gstatic.com',
            crossOrigin: 'true',
        },
        {
            rel: 'stylesheet',
            href: normalizeStylesUrl,
        },
        {
            rel: 'stylesheet',
            href: globablStylesUrl,
        },
        {
            rel: 'stylesheet',
            href: rootStylesUrl,
        },
        ...stylesheets.map((href) => ({ rel: 'stylesheet', href })),
    ];
};

const Document = ({
    children,
    title = `Remix!`,
}: {
    children: React.ReactNode;
    title?: string;
}): JSX.Element => (
    <html lang="en">
        <head>
            <meta charSet="utf-8" />
            <meta name="viewport" content="width=device-width,initial-scale=1" />
            <Meta />
            <title>{title}</title>
            <Links />
            {typeof document === 'undefined' ? '__STYLES__' : null}
        </head>
        <body>
            {children}
            <ScrollRestoration />
            <Scripts />
            {process.env.NODE_ENV === 'development' && <LiveReload />}
        </body>
    </html>
);

const App = () => (
    <Document>
        <main id="main" className="main">
            <Outlet />
        </main>
    </Document>
);

export const CatchBoundary = () => {
    const caught = useCatch();
    return (
        <Document title={`${caught.status} ${caught.statusText}`}>
            <div className="error-container">
                <h1>
                    {caught.status} {caught.statusText}
                </h1>
            </div>
        </Document>
    );
};

/**
 * Remember to update the title
 */
export const ErrorBoundary = ({ error }: { error: Error }) => (
    <Document title="Uh-oh!">
        <div className="error-container">
            <h1>App Error</h1>
            <pre>{error.message}</pre>
            <pre>{error.stack}</pre>
        </div>
    </Document>
);

export default App;
