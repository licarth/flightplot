import type { PropsWithChildren, SetStateAction } from 'react';
import React, { createContext, useContext, useState } from 'react';

type HelpFormat = 'modal' | 'drawer';

export const HelpPageContext = createContext<{
    pageId?: string;
    format: HelpFormat;
    isOpen: boolean;
    open: () => void;
    close: () => void;
    setPageId: React.Dispatch<SetStateAction<string | undefined>>;
    goToPage: (pageId: string) => void;
    setFormat: React.Dispatch<SetStateAction<HelpFormat>>;
}>({
    format: 'drawer',
    setPageId: () => {},
    goToPage: () => {},
    setFormat: () => {},
    isOpen: false,
    open: () => {},
    close: () => {},
});

export const HelpPageProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [pageId, setPageId] = useState<string | undefined>('0e2ee51bb50c436796dbb845f9aecc48');
    const [format, setFormat] = useState<HelpFormat>('drawer');
    const [open, setOpen] = useState<boolean>(false);

    const goToPage = (pageId: string) => {
        setOpen(true);
        setPageId(pageId);
    };

    return (
        <HelpPageContext.Provider
            value={{
                pageId,
                setPageId,
                setFormat,
                goToPage,
                format,
                isOpen: open,
                open: () => setOpen(true),
                close: () => setOpen(false),
            }}
        >
            {children}
        </HelpPageContext.Provider>
    );
};

export const useHelpPage = () => {
    return useContext(HelpPageContext);
};
