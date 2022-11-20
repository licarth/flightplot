import type { SearcheableElement } from '../SearchBar';
import { FixtureRow } from './FixtureDetails';

type SearchableElementDetailsProps = {
    searchableElement: SearcheableElement;
    onClose: () => void;
};

export const SearchElementDetails = ({
    searchableElement,
    onClose,
}: SearchableElementDetailsProps) => {
    return <FixtureRow fixture={searchableElement}></FixtureRow>;
};
