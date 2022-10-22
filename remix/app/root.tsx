import type { LinksFunction, LoaderFunction, MetaFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import {
    Links,
    LiveReload,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    useCatch,
    useLoaderData,
} from '@remix-run/react';
import _ from 'lodash';

export const loader: LoaderFunction = async (p) => {
    if (new URL(p.request.url).host === 'flightplot.fly.dev') {
        return redirect('https://www.flightplot.fr');
    }

    return json({
        ENV: {
            ..._.pickBy(process.env, (value, key) => key.startsWith('PUBLIC_')),
        },
    });
};

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
        // { rel: 'stylesheet', href: styles },
        {
            rel: 'preconnect',
            href: 'https://fonts.googleapis.com',
        },
        {
            rel: 'preconnect',
            href: 'https://fonts.gstatic.com',
            crossOrigin: 'true',
        },
        // {
        //     rel: 'stylesheet',
        //     href: normalizeStylesUrl,
        // },
        // {
        //     rel: 'stylesheet',
        //     href: globablStylesUrl,
        // },
        // {
        //     rel: 'stylesheet',
        //     href: rootStylesUrl,
        // },
        // ...stylesheets.map((href) => ({ rel: 'stylesheet', href })),
    ];
};

const Document = ({
    children,
    title = `Remix!`,
}: {
    children: React.ReactNode;
    title?: string;
}): JSX.Element => {
    return (
        <html lang="en">
            <head>
                <script
                    async
                    src="https://www.googletagmanager.com/gtag/js?id=G-B9VRCW8QML"
                ></script>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                  
                    gtag('config', 'G-B9VRCW8QML');
        `,
                    }}
                />
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
};

const App = () => {
    const data = useLoaderData();

    return (
        <Document>
            <main id="main" className="main">
                <Outlet />
                <script
                    dangerouslySetInnerHTML={{
                        __html: `window.ENV = ${JSON.stringify(data.ENV)}`,
                    }}
                />
            </main>
        </Document>
    );
};

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
