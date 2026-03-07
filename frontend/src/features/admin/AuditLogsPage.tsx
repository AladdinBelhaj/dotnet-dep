import { useMemo, useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    InputAdornment,
    Chip,
} from '@mui/material';
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    type ColumnDef,
    flexRender,
    type SortingState,
} from '@tanstack/react-table';
import { Search, Security } from '@mui/icons-material';

// Mock Data for Audit Logs
const auditData = [
    { id: 1, action: 'LOGIN', user: 'admin', date: '2023-10-25T08:30:00', details: 'User logged in successfully', ip: '192.168.1.1' },
    { id: 2, action: 'CREATE_PRODUCT', user: 'admin', date: '2023-10-25T09:15:00', details: 'Created product "Laptop Dell XPS"', ip: '192.168.1.1' },
    { id: 3, action: 'UPDATE_STOCK', user: 'comptable1', date: '2023-10-25T10:00:00', details: 'Adjusted stock for "Mouse Logitech" (+50)', ip: '192.168.1.20' },
    { id: 4, action: 'LOGIN', user: 'comptable1', date: '2023-10-25T09:55:00', details: 'User logged in successfully', ip: '192.168.1.20' },
    { id: 5, action: 'DELETE_PRODUCT', user: 'admin', date: '2023-10-24T14:30:00', details: 'Deleted product "Obsolete Cable"', ip: '192.168.1.1' },
    { id: 6, action: 'EXPORT_DATA', user: 'comptable1', date: '2023-10-24T16:00:00', details: 'Exported Inventory to Excel', ip: '192.168.1.20' },
    { id: 7, action: 'FAILED_LOGIN', user: 'unknown', date: '2023-10-24T18:00:00', details: 'Failed login attempt for user "root"', ip: '10.0.0.55' },
];

export const AuditLogsPage = () => {
    const [globalFilter, setGlobalFilter] = useState('');
    const [sorting, setSorting] = useState<SortingState>([{ id: 'date', desc: true }]);

    const columns = useMemo<ColumnDef<typeof auditData[0]>[]>(
        () => [
            {
                accessorKey: 'id',
                header: 'ID',
                size: 60,
            },
            {
                accessorKey: 'action',
                header: 'Action',
                cell: ({ getValue }) => {
                    const action = getValue() as string;
                    let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';

                    if (action.includes('LOGIN')) color = 'info';
                    if (action.includes('CREATE')) color = 'success';
                    if (action.includes('DELETE')) color = 'error';
                    if (action.includes('UPDATE')) color = 'warning';
                    if (action.includes('FAILED')) color = 'error';

                    return <Chip label={action} color={color} size="small" variant="outlined" />;
                },
            },
            {
                accessorKey: 'user',
                header: 'User',
            },
            {
                accessorKey: 'date',
                header: 'Timestamp',
                cell: ({ getValue }) => new Date(getValue() as string).toLocaleString(),
            },
            {
                accessorKey: 'details',
                header: 'Description',
                size: 300,
            },
            {
                accessorKey: 'ip',
                header: 'IP Address',
            },
        ],
        []
    );

    const table = useReactTable({
        data: auditData,
        columns,
        state: {
            globalFilter,
            sorting,
        },
        onGlobalFilterChange: setGlobalFilter,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
                <Security fontSize="large" color="primary" />
                <Typography variant="h4" fontWeight="bold">
                    System Audit Logs
                </Typography>
            </Box>

            <Paper sx={{ p: 2, mb: 2 }}>
                <TextField
                    placeholder="Search logs..."
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    size="small"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ width: 300 }}
                />
            </Paper>

            <Paper sx={{ overflow: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: '#f5f5f5' }}>
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th key={header.id} style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '2px solid #e0e0e0' }}>
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.map(row => (
                            <tr key={row.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                                {row.getVisibleCells().map(cell => (
                                    <td key={cell.id} style={{ padding: '12px 16px' }}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {table.getRowModel().rows.length === 0 && (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography color="text.secondary">No logs found.</Typography>
                    </Box>
                )}
            </Paper>
        </Box>
    );
};
