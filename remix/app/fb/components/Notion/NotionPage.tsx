import { Skeleton } from 'antd';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import type { SetPageId } from './NotionPart.client';
import { NotionPart } from './NotionPart.client';

export const NotionPage = ({ pageId, setPageId }: { pageId?: string; setPageId: SetPageId }) => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);
    const [recordMap, setRecordMap] = useState();

    useEffect(() => {
        fetch(`notion/${pageId}`)
            .then((res) => res.json())
            .then(({ recordMap }) => setRecordMap(recordMap));
        return () => {
            setRecordMap(() => undefined);
        };
    }, [pageId]);

    return pageId && !!recordMap && mounted ? (
        <NotionPart setPageId={setPageId} recordMap={recordMap} />
    ) : (
        <StyledSkeleton active />
    );
};

const StyledSkeleton = styled(Skeleton)`
    padding: 24px;
`;
