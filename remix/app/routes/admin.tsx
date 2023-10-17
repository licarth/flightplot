import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { formatInTimeZone } from 'date-fns-tz';
import type { LoaderFunction } from 'remix';
import { redirect } from 'remix';
import styled from 'styled-components';
import { AiracDataProvider } from '~/fb/components/AiracDataContext';
import { NotamsProvider, useNotams } from '~/fb/contexts/NotamsContext';
import { RtbaZonesProvider } from '~/fb/contexts/RtbaZonesContext';
import { environmentVariable } from '~/fb/environmentVariable';
import { FirebaseAuthProvider } from '~/fb/firebase/auth/FirebaseAuthContext';
import { requireUserId } from '~/utils/session.server';
import { ChakraProvider, Table, Tbody, Th, Thead, Tr } from '@chakra-ui/react';

export default () => {
    return (
        <AppContainer id="app">
            <ChakraProvider>
                <FirebaseAuthProvider>
                    <AiracDataProvider>
                        <RtbaZonesProvider>
                            <NotamsProvider>
                                <NotamsTable />
                            </NotamsProvider>
                        </RtbaZonesProvider>
                    </AiracDataProvider>
                </FirebaseAuthProvider>{' '}
            </ChakraProvider>
        </AppContainer>
    );
};

const NotamsTable = () => {
    // const { activeRestrictedAreasNext24h, activePjeNext24h } = useRtbaZones();
    const { notams } = useNotams();

    const data = notams.map(({ notam, rawNotam }) => ({
        notam,
        notamString: notam.toString(),
        rawNotam,
    }));

    const columnHelper = createColumnHelper<typeof data[number]>();

    const table = useReactTable({
        columns: [
            columnHelper.accessor('notamString', {
                header: () => <span>Notam</span>,
                cell: (props) => <LogOutput>{props.cell.getValue()}</LogOutput>,
            }),
            columnHelper.accessor((o) => formatInTimeZone(o.notam.b.date!, 'Z', 'd MMM HH:mm'), {
                header: () => <span>Start</span>,
                id: 'b',
            }),
            columnHelper.accessor(
                (o) =>
                    o.notam.c?.date
                        ? formatInTimeZone(o.notam.c?.date, 'Z', 'd MMM HH:mm')
                        : 'PERM',
                {
                    header: () => <span>End</span>,
                    id: 'c',
                },
            ),
        ],
        data,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <>
            <div>{table.getRowModel().rows.length} Notams</div>

            {/* <Table columns={columns} dataSource={data} size="small" /> */}
            <div className="p-2">
                <div className="h-2" />
                <Table size={'sm'}>
                    <Thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <Tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <Th key={header.id} colSpan={header.colSpan}>
                                            {header.isPlaceholder ? null : (
                                                <div
                                                    {...{
                                                        className: header.column.getCanSort()
                                                            ? 'cursor-pointer select-none'
                                                            : '',
                                                        onClick:
                                                            header.column.getToggleSortingHandler(),
                                                    }}
                                                >
                                                    {flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext(),
                                                    )}
                                                    {{
                                                        asc: ' 🔼',
                                                        desc: ' 🔽',
                                                    }[header.column.getIsSorted() as string] ??
                                                        null}
                                                </div>
                                            )}
                                        </Th>
                                    );
                                })}
                            </Tr>
                        ))}
                    </Thead>
                    <Tbody>
                        {table.getRowModel().rows.map((row) => {
                            return (
                                <tr key={row.id}>
                                    {row.getVisibleCells().map((cell) => {
                                        return (
                                            <td key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext(),
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </Tbody>
                </Table>
            </div>
        </>
    );
};

const AppContainer = styled.div`
    height: 100%;
`;

export const loader: LoaderFunction = async ({ request }) => {
    const user = await requireUserId(request);
    if (
        (user && user.email === 'thomascarli@gmail.com') ||
        environmentVariable('PUBLIC_USE_EMULATORS') === 'true'
    ) {
        return {};
    } else {
        return redirect('/');
    }
};

const LogOutput = styled.pre`
    white-space: pre-wrap;
    // small
    font-size: 0.7rem;
`;
