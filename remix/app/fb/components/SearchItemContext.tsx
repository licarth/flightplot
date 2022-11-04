import type { PropsWithChildren } from 'react';
import React, { createContext, useState } from 'react';
import type { SearcheableElement } from './SearchBar';

export const SearchItemContext = createContext<{
    item?: SearcheableElement;
    setItem: (item: SearcheableElement) => void;
}>({});

export const SearcheableElementProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [item, setItem] = useState<SearcheableElement>();

    return (
        <SearchItemContext.Provider value={{ item, setItem }}>
            {children}
        </SearchItemContext.Provider>
    );
};

export const useSearchElement = () => {
    return React.useContext(SearchItemContext);
};
