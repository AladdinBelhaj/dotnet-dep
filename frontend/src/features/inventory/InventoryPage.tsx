import { useState, useMemo } from 'react';
import {
    Box,
    Paper,
    TextField,
    Button,
    Menu,
    MenuItem,
    Checkbox,
    FormControlLabel,
    FormGroup,
    Typography,
    Chip,
    InputAdornment,
    Stack,
    IconButton,
    Tooltip,
} from '@mui/material';
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    getGroupedRowModel,
    getExpandedRowModel,
    type ColumnDef,
    flexRender,
    type SortingState,
    type ColumnFiltersState,
    type VisibilityState,
    type GroupingState,
    type ExpandedState,
} from '@tanstack/react-table';
import {
    ArrowUpward,
    ArrowDownward,
    Download,
    ViewColumn,
    Search,
    Add,
    Edit,
    Delete,
    SwapVert,
    Category as CategoryIcon,
    LocalShipping,
    KeyboardArrowRight,
    KeyboardArrowDown,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsService } from '../../api/services/products';
import type { Product } from '../../types';
import { exportToExcel, exportToPDF } from '../../utils/export';

// Dialogs
import { ProductFormDialog } from './components/ProductFormDialog';
import { CategoryManagerDialog } from './components/CategoryManagerDialog';
import { SupplierManagerDialog } from './components/SupplierManagerDialog';
import { StockMovementDialog } from './components/StockMovementDialog';

export const InventoryPage = () => {
    const queryClient = useQueryClient();

    // Table State
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [grouping, setGrouping] = useState<GroupingState>([]);
    const [expanded, setExpanded] = useState<ExpandedState>({});
    const [anchorElColumns, setAnchorElColumns] = useState<null | HTMLElement>(null);
    const [anchorElExport, setAnchorElExport] = useState<null | HTMLElement>(null);

    // Dialog State
    const [openProductDialog, setOpenProductDialog] = useState(false);
    const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
    const [openSupplierDialog, setOpenSupplierDialog] = useState(false);
    const [openStockDialog, setOpenStockDialog] = useState(false);

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const { data: products = [], isLoading } = useQuery<Product[]>({
        queryKey: ['products'],
        queryFn: productsService.getAll,
    });

    const deleteMutation = useMutation({
        mutationFn: productsService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });

    const handleEditProduct = (product: Product) => {
        setSelectedProduct(product);
        setOpenProductDialog(true);
    };

    const handleDeleteProduct = (id: number) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleStockClick = (product: Product) => {
        setSelectedProduct(product);
        setOpenStockDialog(true);
    };

    const handleAddProduct = () => {
        setSelectedProduct(null);
        setOpenProductDialog(true);
    };

    const columns = useMemo<ColumnDef<Product>[]>(
        () => [
            {
                accessorKey: 'id',
                header: 'ID',
                size: 80,
                enableGrouping: false,
            },
            {
                accessorKey: 'name',
                header: 'Product Name',
                size: 200,
                cell: ({ getValue }) => <strong>{getValue() as string}</strong>,
            },
            {
                id: 'category',
                accessorFn: (row) => row.category?.name ?? 'Uncategorized',
                header: 'Category',
                size: 150,
                enableGrouping: true,
                cell: ({ getValue, row, column }) => {
                    const value = getValue() as string;
                    if (row.getIsGrouped() && row.groupingColumnId === column.id) {
                        return (
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <IconButton
                                    size="small"
                                    onClick={row.getToggleExpandedHandler()}
                                    sx={{ cursor: 'pointer' }}
                                >
                                    {row.getIsExpanded() ? <KeyboardArrowDown /> : <KeyboardArrowRight />}
                                </IconButton>
                                <Typography fontWeight="bold">
                                    {value} ({row.subRows.length})
                                </Typography>
                            </Stack>
                        );
                    }
                    return row.getIsGrouped() ? null : value;
                },
            },
            {
                id: 'supplier',
                accessorFn: (row) => row.supplier?.name ?? 'Unknown Supplier',
                header: 'Supplier',
                size: 150,
                enableGrouping: true,
                cell: ({ getValue, row, column }) => {
                    const value = getValue() as string;
                    if (row.getIsGrouped() && row.groupingColumnId === column.id) {
                        return (
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <IconButton
                                    size="small"
                                    onClick={row.getToggleExpandedHandler()}
                                    sx={{ cursor: 'pointer' }}
                                >
                                    {row.getIsExpanded() ? <KeyboardArrowDown /> : <KeyboardArrowRight />}
                                </IconButton>
                                <Typography fontWeight="bold">
                                    {value} ({row.subRows.length})
                                </Typography>
                            </Stack>
                        );
                    }
                    return row.getIsGrouped() ? null : value;
                },
            },
            {
                id: 'quantity',
                accessorKey: 'quantity',
                header: 'Quantity',
                size: 140,
                cell: ({ row, getValue }) => {
                    const quantity = getValue() as number;
                    const minStock = row.original.minStock;
                    const isLow = quantity < minStock;

                    return (
                        <Tooltip title={isLow
                            ? `Low Stock! Current: ${quantity} < Min: ${minStock}`
                            : `Stock OK. Current: ${quantity} >= Min: ${minStock}`
                        }>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Chip
                                    label={`${quantity} units`}
                                    color={isLow ? 'error' : 'success'}
                                    variant={isLow ? 'filled' : 'outlined'}
                                    size="small"
                                    sx={{ fontWeight: 'bold' }}
                                />
                                {isLow && (
                                    <Typography variant="caption" color="error" fontWeight="bold">
                                        Low!
                                    </Typography>
                                )}
                            </Stack>
                        </Tooltip>
                    );
                },
            },
            {
                accessorKey: 'minStock',
                header: 'Min Stock',
                size: 120,
            },
            {
                id: 'actions',
                header: 'Actions',
                size: 150,
                enableGrouping: false,
                cell: ({ row }) => {
                    const product = row.original;
                    return (
                        <Stack direction="row" spacing={1}>
                            <Tooltip title="Stock Movement">
                                <IconButton size="small" color="primary" onClick={() => handleStockClick(product)}>
                                    <SwapVert />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit">
                                <IconButton size="small" onClick={() => handleEditProduct(product)}>
                                    <Edit />
                                </IconButton>
                            </Tooltip>
                            {/* Typically delete is dangerous, maybe only for admin or restricted */}
                            <Tooltip title="Delete">
                                <IconButton size="small" color="error" onClick={() => handleDeleteProduct(product.id)}>
                                    <Delete />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    );
                },
            },
        ],
        []
    );

    const table = useReactTable({
        data: products,
        columns,
        state: {
            sorting,
            columnFilters,
            globalFilter,
            columnVisibility,
            grouping,
            expanded,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        onColumnVisibilityChange: setColumnVisibility,
        onGroupingChange: setGrouping,
        onExpandedChange: setExpanded,
        enableColumnResizing: true,
        columnResizeMode: 'onChange',
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getGroupedRowModel: getGroupedRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
    });

    const handleExportExcel = () => {
        const exportData = table.getFilteredRowModel().rows.map((row) => ({
            ID: row.original.id,
            Name: row.original.name,
            Category: row.original.category?.name || '',
            Supplier: row.original.supplier?.name || '',
            Quantity: row.original.quantity,
            MinStock: row.original.minStock,
        }));
        exportToExcel(exportData, 'Inventory');
        setAnchorElExport(null);
    };

    const handleExportPDF = () => {
        const exportData = table.getFilteredRowModel().rows.map((row) => ({
            ID: row.original.id,
            Name: row.original.name,
            Category: row.original.category?.name || '',
            Supplier: row.original.supplier?.name || '',
            Quantity: row.original.quantity,
            MinStock: row.original.minStock,
        }));
        exportToPDF(exportData, ['ID', 'Name', 'Category', 'Supplier', 'Quantity', 'MinStock'], 'Inventory');
        setAnchorElExport(null);
    };

    if (isLoading) {
        return <Typography>Loading inventory...</Typography>;
    }

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight="bold">
                    Inventory Management
                </Typography>
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="outlined"
                        startIcon={<CategoryIcon />}
                        onClick={() => setOpenCategoryDialog(true)}
                    >
                        Categories
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<LocalShipping />}
                        onClick={() => setOpenSupplierDialog(true)}
                    >
                        Suppliers
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={handleAddProduct}
                    >
                        Add Product
                    </Button>
                </Stack>
            </Stack>

            <Paper sx={{ p: 2, mb: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                    <TextField
                        placeholder="Search all columns..."
                        value={globalFilter ?? ''}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        size="small"
                        sx={{ minWidth: 300 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Button
                        variant={grouping.includes('category') ? 'contained' : 'outlined'}
                        onClick={() => {
                            setGrouping(old =>
                                old.includes('category')
                                    ? old.filter(g => g !== 'category')
                                    : [...old, 'category']
                            );
                        }}
                    >
                        Group Category
                    </Button>
                    <Button
                        variant={grouping.includes('supplier') ? 'contained' : 'outlined'}
                        onClick={() => {
                            setGrouping(old =>
                                old.includes('supplier')
                                    ? old.filter(g => g !== 'supplier')
                                    : [...old, 'supplier']
                            );
                        }}
                    >
                        Group Supplier
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<ViewColumn />}
                        onClick={(e) => setAnchorElColumns(e.currentTarget)}
                    >
                        Columns
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<Download />}
                        onClick={(e) => setAnchorElExport(e.currentTarget)}
                    >
                        Export
                    </Button>
                    <Typography variant="body2" sx={{ ml: 'auto' }}>
                        {table.getFilteredRowModel().rows.length} products
                    </Typography>
                </Stack>
            </Paper>

            {/* Column Visibility Menu */}
            <Menu
                anchorEl={anchorElColumns}
                open={Boolean(anchorElColumns)}
                onClose={() => setAnchorElColumns(null)}
            >
                <Box sx={{ p: 2, minWidth: 200 }}>
                    <Typography variant="subtitle2" gutterBottom>
                        Toggle Columns
                    </Typography>
                    <FormGroup>
                        {table.getAllLeafColumns().map((column) => (
                            <FormControlLabel
                                key={column.id}
                                control={
                                    <Checkbox
                                        checked={column.getIsVisible()}
                                        onChange={column.getToggleVisibilityHandler()}
                                    />
                                }
                                label={column.id}
                            />
                        ))}
                    </FormGroup>
                </Box>
            </Menu>

            {/* Export Menu */}
            <Menu
                anchorEl={anchorElExport}
                open={Boolean(anchorElExport)}
                onClose={() => setAnchorElExport(null)}
            >
                <MenuItem onClick={handleExportExcel}>Export to Excel</MenuItem>
                <MenuItem onClick={handleExportPDF}>Export to PDF</MenuItem>
            </Menu>

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
                                                width: header.getSize(),
                                                padding: '12px 16px',
                                                textAlign: 'left',
                                                borderBottom: '2px solid #e0e0e0',
                                                backgroundColor: '#f5f5f5',
                                                fontWeight: 600,
                                                position: 'relative',
                                                cursor: header.column.getCanSort() ? 'pointer' : 'default',
                                            }}
                                        >
                                            <Box
                                                onClick={header.column.getToggleSortingHandler()}
                                                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                                            >
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                                {header.column.getIsSorted() === 'asc' && <ArrowUpward fontSize="small" />}
                                                {header.column.getIsSorted() === 'desc' && <ArrowDownward fontSize="small" />}
                                            </Box>
                                            <div
                                                onMouseDown={header.getResizeHandler()}
                                                onTouchStart={header.getResizeHandler()}
                                                style={{
                                                    position: 'absolute',
                                                    right: 0,
                                                    top: 0,
                                                    height: '100%',
                                                    width: '5px',
                                                    cursor: 'col-resize',
                                                    userSelect: 'none',
                                                    touchAction: 'none',
                                                    backgroundColor: header.column.getIsResizing() ? '#1976d2' : 'transparent',
                                                }}
                                            />
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

            {/* Dialogs */}
            <ProductFormDialog
                open={openProductDialog}
                onClose={() => setOpenProductDialog(false)}
                productToEdit={selectedProduct}
            />
            <CategoryManagerDialog
                open={openCategoryDialog}
                onClose={() => setOpenCategoryDialog(false)}
            />
            <SupplierManagerDialog
                open={openSupplierDialog}
                onClose={() => setOpenSupplierDialog(false)}
            />
            <StockMovementDialog
                open={openStockDialog}
                onClose={() => setOpenStockDialog(false)}
                product={selectedProduct}
            />
        </Box>
    );
};
