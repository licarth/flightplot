import type { SearcheableElement } from '../SearchBar';

type SearchableElementDetailsProps = {
    searchableElement: SearcheableElement;
    onClose: () => void;
};

export const SearchElementDetails = ({
    searchableElement,
    onClose,
}: SearchableElementDetailsProps) => {
    return <>{searchableElement?.name}</>;
};
