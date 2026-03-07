import { useMemo } from 'react';
import {
    Box,
    Grid,
    Paper,
    Typography,
    Stack,
    Card,
    CardContent,
    LinearProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Divider,
} from '@mui/material';
import {
    TrendingUp,
    Warning,
    Inventory,
    AttachMoney,
    History,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { productsService } from '../../api/services/products';
import { stockService } from '../../api/services/stock';
import type { Product, StockMovement } from '../../types';

export const ReportsPage = () => {
    const { data: products = [], isLoading: loadingProducts } = useQuery<Product[]>({
        queryKey: ['products'],
        queryFn: productsService.getAll,
    });

    const { data: movements = [], isLoading: loadingMovements } = useQuery<StockMovement[]>({
        queryKey: ['stockHistory'],
        queryFn: stockService.getHistory,
    });

    const stats = useMemo(() => {
        const totalProducts = products.length;
        const totalValue = products.reduce((sum, p) => sum + (p.price || 0) * p.quantity, 0);
        const lowStockItems = products.filter(p => p.quantity <= p.minStock);
        const lowStockCount = lowStockItems.length;

        // Group by category
        const valueByCategory: Record<string, number> = {};
        products.forEach(p => {
            const catName = p.category?.name || 'Uncategorized';
            valueByCategory[catName] = (valueByCategory[catName] || 0) + ((p.price || 0) * p.quantity);
        });

        // Top val products
        const topValProducts = [...products]
            .sort((a, b) => ((b.price || 0) * b.quantity) - ((a.price || 0) * a.quantity))
            .slice(0, 5);

        return {
            totalProducts,
            totalValue,
            lowStockItems,
            lowStockCount,
            valueByCategory,
            topValProducts
        };
    }, [products]);

    const recentMovements = movements.slice(0, 10);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'TND' }).format(val);
    };

    if (loadingProducts || loadingMovements) {
        return <LinearProgress />;
    }

    return (
        <Box>
            <Typography variant="h4" fontWeight="bold" mb={3}>
                Reports & Analytics
            </Typography>

            {/* Summary Cards */}
            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                <Box>
                                    <Typography color="textSecondary" gutterBottom variant="subtitle2">
                                        Total Inventory Value
                                    </Typography>
                                    <Typography variant="h5" fontWeight="bold">
                                        {formatCurrency(stats.totalValue)}
                                    </Typography>
                                </Box>
                                <AttachMoney color="primary" />
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                <Box>
                                    <Typography color="textSecondary" gutterBottom variant="subtitle2">
                                        Total Products
                                    </Typography>
                                    <Typography variant="h5" fontWeight="bold">
                                        {stats.totalProducts}
                                    </Typography>
                                </Box>
                                <Inventory color="info" />
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                <Box>
                                    <Typography color="textSecondary" gutterBottom variant="subtitle2">
                                        Low Stock Alerts
                                    </Typography>
                                    <Typography variant="h5" fontWeight="bold" color="error">
                                        {stats.lowStockCount}
                                    </Typography>
                                </Box>
                                <Warning color="error" />
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                <Box>
                                    <Typography color="textSecondary" gutterBottom variant="subtitle2">
                                        Recent Movements
                                    </Typography>
                                    <Typography variant="h5" fontWeight="bold">
                                        {movements.length}
                                    </Typography>
                                </Box>
                                <History color="success" />
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Main Content Grid */}
            <Grid container spacing={3}>
                {/* Low Stock Table */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                        <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                            <Warning color="error" fontSize="small" /> Low Stock Alerts
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        {stats.lowStockItems.length === 0 ? (
                            <Typography color="textSecondary">No low stock alerts. Good job!</Typography>
                        ) : (
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Product</TableCell>
                                            <TableCell>Reference</TableCell>
                                            <TableCell align="right">Stock</TableCell>
                                            <TableCell align="right">Min Stock</TableCell>
                                            <TableCell align="right">Status</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {stats.lowStockItems.map((product) => (
                                            <TableRow key={product.id}>
                                                <TableCell component="th" scope="row">
                                                    {product.name}
                                                </TableCell>
                                                <TableCell>{product.reference}</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                                                    {product.quantity}
                                                </TableCell>
                                                <TableCell align="right">{product.minStock}</TableCell>
                                                <TableCell align="right">
                                                    <Chip label="Low" color="error" size="small" />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Paper>
                </Grid>

                {/* Top Value Products */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                        <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                            <TrendingUp color="primary" fontSize="small" /> Top Value Assets
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Stack spacing={2}>
                            {stats.topValProducts.map(p => {
                                const value = (p.price || 0) * p.quantity;
                                const percent = (value / stats.totalValue) * 100;
                                return (
                                    <Box key={p.id}>
                                        <Stack direction="row" justifyContent="space-between">
                                            <Typography variant="body2" fontWeight="bold">{p.name}</Typography>
                                            <Typography variant="body2">{formatCurrency(value)}</Typography>
                                        </Stack>
                                        <LinearProgress variant="determinate" value={percent} sx={{ mt: 0.5, borderRadius: 1 }} />
                                    </Box>
                                );
                            })}
                        </Stack>
                    </Paper>
                </Grid>

                {/* Recent Movements Table */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                            <History color="info" fontSize="small" /> Recent Movement History
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Type</TableCell>
                                        <TableCell>Product</TableCell>
                                        <TableCell align="right">Quantity</TableCell>
                                        <TableCell>User</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {recentMovements.map((rows) => (
                                        <TableRow key={rows.id}>
                                            <TableCell>{new Date(rows.movementDate).toLocaleString()}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={rows.type}
                                                    color={rows.type === 'Entry' ? 'success' : 'warning'}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell>{rows.product?.name || `Product #${rows.productId}`}</TableCell>
                                            <TableCell align="right" sx={{
                                                color: rows.quantity > 0 ? 'success.main' : 'warning.main',
                                                fontWeight: 'bold'
                                            }}>
                                                {rows.quantity > 0 ? '+' : ''}{rows.quantity}
                                            </TableCell>
                                            <TableCell>{rows.user?.username || 'Unknown'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};
