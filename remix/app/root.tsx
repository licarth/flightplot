import styles from 'antd/dist/antd.variable.css';
import type { LinksFunction, MetaFunction } from 'remix';
import {
    json,
    Links,
    LiveReload,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    useCatch,
    useLoaderData,
} from 'remix';
import globablStylesUrl from '~styles/global.css';
import rootStylesUrl from '~styles/index.css';
import normalizeStylesUrl from '~styles/__normalize__.css';

export async function loader() {
    return json({
        ENV: {
            USE_EMULATORS: process.env.USE_EMULATORS,
        },
    });
}

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
        { rel: 'stylesheet', href: styles },
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
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                    window['_fs_host'] = 'fullstory.com';
                    window['_fs_script'] = 'edge.fullstory.com/s/fs.js';
                    window['_fs_org'] = 'o-1DMMAY-na1';
                    window['_fs_namespace'] = 'FS';
                    (function(m,n,e,t,l,o,g,y){
                        if (e in m) {if(m.console && m.console.log) { m.console.log('FullStory namespace conflict. Please set window["_fs_namespace"].');} return;}
                        g=m[e]=function(a,b,s){g.q?g.q.push([a,b,s]):g._api(a,b,s);};g.q=[];
                        o=n.createElement(t);o.async=1;o.crossOrigin='anonymous';o.src='https://'+_fs_script;
                        y=n.getElementsByTagName(t)[0];y.parentNode.insertBefore(o,y);
                        g.identify=function(i,v,s){g(l,{uid:i},s);if(v)g(l,v,s)};g.setUserVars=function(v,s){g(l,v,s)};g.event=function(i,v,s){g('event',{n:i,p:v},s)};
                        g.anonymize=function(){g.identify(!!0)};
                        g.shutdown=function(){g("rec",!1)};g.restart=function(){g("rec",!0)};
                        g.log = function(a,b){g("log",[a,b])};
                        g.consent=function(a){g("consent",!arguments.length||a)};
                        g.identifyAccount=function(i,v){o='account';v=v||{};v.acctId=i;g(o,v)};
                        g.clearUserCookie=function(){};
                        g.setVars=function(n, p){g('setVars',[n,p]);};
                        g._w={};y='XMLHttpRequest';g._w[y]=m[y];y='fetch';g._w[y]=m[y];
                        if(m[y])m[y]=function(){return g._w[y].apply(this,arguments)};
                        g._v="1.3.0";
                    })(window,document,window['_fs_namespace'],'script','user');
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
