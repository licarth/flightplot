export const joinReactElements = (
    separator: React.ReactElement | string,
    array: React.ReactElement[],
) =>
    array.reduce(
        (prev, curr, i) =>
            i === 0 ? (
                curr
            ) : (
                <>
                    {prev}
                    {separator}
                    {curr}
                </>
            ),
        <></>,
    );
