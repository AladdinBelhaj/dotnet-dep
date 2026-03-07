import { useState, useMemo } from 'react';
import {
    Box,
    Paper,
    TextField,
    Button,
    Typography,
    Chip,
    InputAdornment,
    Stack,
} from '@mui/material';
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    type ColumnDef,
    flexRender,
    type SortingState,
} from '@tanstack/react-table';
import { ArrowUpward, ArrowDownward, Search, Download } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { api } from '../../api/axios';
import type { StockMovement } from '../../types';
import { exportToExcel } from '../../utils/export';
import { format } from 'date-fns';

export const MovementsPage = () => {
    const [sorting, setSorting] = useState<SortingState>([{ id: 'movementDate', desc: true }]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);

    const { data: movements = [], isLoading } = useQuery<StockMovement[]>({
        queryKey: ['movements'],
        queryFn: async () => {
            const response = await api.get('/stock/history');
            return response.data;
        },
    });

    const filteredMovements = useMemo(() => {
        return movements.filter((movement) => {
            const movementDate = new Date(movement.movementDate);
            if (startDate && movementDate < startDate) return false;
            if (endDate && movementDate > endDate) return false;
            return true;
        });
    }, [movements, startDate, endDate]);

    const columns = useMemo<ColumnDef<StockMovement>[]>(
        () => [
            {
                accessorKey: 'id',
                header: 'ID',
                size: 80,
            },
            {
                accessorKey: 'product.name',
                header: 'Product',
                size: 200,
                cell: ({ getValue }) => <strong>{getValue() as string || 'N/A'}</strong>,
            },
            {
                accessorKey: 'type',
                header: 'Type',
                size: 120,
                cell: ({ getValue }) => {
                    const type = getValue() as string;
                    return (
                        <Chip
                            label={type}
                            color={type === 'Entry' ? 'success' : 'error'}
                            size="small"
                        />
                    );
                },
            },
            {
                accessorKey: 'quantity',
                header: 'Quantity',
                size: 120,
                cell: ({ getValue, row }) => {
                    const quantity = getValue() as number;
                    const type = row.original.type;
                    return (
                        <Typography
                            color={type === 'Entry' ? 'success.main' : 'error.main'}
                            fontWeight="bold"
                        >
                            {type === 'Entry' ? '+' : ''}{quantity}
                        </Typography>
                    );
                },
            },
            {
                accessorKey: 'movementDate',
                header: 'Date',
                size: 180,
                cell: ({ getValue }) => {
                    const date = new Date(getValue() as string);
                    return format(date, 'yyyy-MM-dd HH:mm:ss');
                },
            },
            {
                accessorKey: 'user.username',
                header: 'User',
                size: 150,
                cell: ({ getValue }) => getValue() as string || 'N/A',
            },
        ],
        []
    );

    const table = useReactTable({
        data: filteredMovements,
        columns,
        state: {
            sorting,
            globalFilter,
        },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    const handleExportExcel = () => {
        const exportData = table.getFilteredRowModel().rows.map((row) => ({
            ID: row.original.id,
            Product: row.original.product?.name || '',
            Type: row.original.type,
            Quantity: row.original.quantity,
            Date: format(new Date(row.original.movementDate), 'yyyy-MM-dd HH:mm:ss'),
            User: row.original.user?.username || '',
        }));
        exportToExcel(exportData, 'Movements');
    };

    if (isLoading) {
        return <Typography>Loading movements...</Typography>;
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom fontWeight="bold">
                Stock Movements History
            </Typography>

            <Paper sx={{ p: 2, mb: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                    <TextField
                        placeholder="Search..."
                        value={globalFilter ?? ''}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        size="small"
                        sx={{ minWidth: 250 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <DatePicker
                        label="Start Date"
                        value={startDate}
                        onChange={(date) => setStartDate(date)}
                        slotProps={{ textField: { size: 'small' } }}
                    />
                    <DatePicker
                        label="End Date"
                        value={endDate}
                        onChange={(date) => setEndDate(date)}
                        slotProps={{ textField: { size: 'small' } }}
                    />
                    <Button
                        variant="outlined"
                        startIcon={<Download />}
                        onClick={handleExportExcel}
                    >
                        Export
                    </Button>
                    <Typography variant="body2" sx={{ ml: 'auto' }}>
                        {table.getFilteredRowModel().rows.length} movements
                    </Typography>
                </Stack>
            </Paper>

            {/* Table */}
            <Paper sx={{ overflow: 'auto' }}>
                <Box sx={{ minWidth: 800 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <th
                                            key={header.id}
                                            style={{
                                                padding: '12px 16px',
                                                textAlign: 'left',
                                                borderBottom: '2px solid #e0e0e0',
                                                backgroundColor: '#f5f5f5',
                                                fontWeight: 600,
                                                cursor: header.column.getCanSort() ? 'pointer' : 'default',
                                            }}
                                            onClick={header.column.getToggleSortingHandler()}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                                {header.column.getIsSorted() === 'asc' && <ArrowUpward fontSize="small" />}
                                                {header.column.getIsSorted() === 'desc' && <ArrowDownward fontSize="small" />}
                                            </Box>
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {table.getRowModel().rows.map((row) => (
                                <tr
                                    key={row.id}
                                    style={{
                                        borderBottom: '1px solid #e0e0e0',
                                        backgroundColor: row.index % 2 === 0 ? '#ffffff' : '#fafafa',
                                    }}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <td key={cell.id} style={{ padding: '12px 16px' }}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Box>

                {/* Pagination */}
                <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, borderTop: '1px solid #e0e0e0' }}>
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Typography variant="body2">
                        Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                    </Typography>
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                    <select
                        value={table.getState().pagination.pageSize}
                        onChange={(e) => table.setPageSize(Number(e.target.value))}
                        style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    >
                        {[10, 20, 50, 100].map((size) => (
                            <option key={size} value={size}>
                                Show {size}
                            </option>
                        ))}
                    </select>
                </Box>
            </Paper>
        </Box>
    );
};
