import { Grid, Paper, Typography, Box, Alert } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/axios';
import type { Product, StockMovement } from '../../types';
import { KPICard } from '../../components/Dashboard/KPICard';
import {
    Inventory as InventoryIcon,
    Warning as WarningIcon,
    MoveToInbox as MovementsIcon,
    TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

export const Dashboard = () => {
    const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
        queryKey: ['products'],
        queryFn: async () => {
            const response = await api.get('/products');
            return response.data;
        },
    });

    const { data: movements = [], isLoading: movementsLoading } = useQuery<StockMovement[]>({
        queryKey: ['movements'],
        queryFn: async () => {
            const response = await api.get('/stock/history');
            return response.data;
        },
    });

    // Calculate KPIs
    const totalStock = products.reduce((sum, p) => sum + p.quantity, 0);
    const lowStockProducts = products.filter((p) => p.quantity < p.minStock);
    const totalProducts = products.length;

    // Movements today
    const today = new Date().toISOString().split('T')[0];
    const movementsToday = movements.filter(
        (m) => m.movementDate.split('T')[0] === today
    );

    // Prepare chart data - Most used products (by movement count)
    const productMovementCounts = movements.reduce((acc, m) => {
        const productName = m.product?.name || `Product ${m.productId}`;
        acc[productName] = (acc[productName] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const topProducts = Object.entries(productMovementCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

    // Stock evolution (last 7 days) - simplified mock data
    const stockEvolution = [
        { date: 'Mon', stock: totalStock - 50 },
        { date: 'Tue', stock: totalStock - 30 },
        { date: 'Wed', stock: totalStock - 20 },
        { date: 'Thu', stock: totalStock - 10 },
        { date: 'Fri', stock: totalStock },
        { date: 'Sat', stock: totalStock + 5 },
        { date: 'Sun', stock: totalStock },
    ];

    if (productsLoading || movementsLoading) {
        return <Typography>Loading dashboard...</Typography>;
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom fontWeight="bold">
                Dashboard Overview
            </Typography>

            {/* KPI Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <KPICard
                        title="Total Products"
                        value={totalProducts}
                        icon={<InventoryIcon />}
                        color="#1976d2"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <KPICard
                        title="Total Stock"
                        value={totalStock}
                        icon={<TrendingUpIcon />}
                        color="#2e7d32"
                        trend="+5% from last week"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <KPICard
                        title="Low Stock Alerts"
                        value={lowStockProducts.length}
                        icon={<WarningIcon />}
                        color="#ed6c02"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <KPICard
                        title="Movements Today"
                        value={movementsToday.length}
                        icon={<MovementsIcon />}
                        color="#9c27b0"
                    />
                </Grid>
            </Grid>

            {/* Alerts Panel */}
            {lowStockProducts.length > 0 && (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom fontWeight="bold">
                                Low Stock Alerts
                            </Typography>
                            {lowStockProducts.slice(0, 5).map((product) => (
                                <Alert severity="warning" key={product.id} sx={{ mb: 1 }}>
                                    <strong>{product.name}</strong>: Current stock {product.quantity} is below minimum {product.minStock}
                                </Alert>
                            ))}
                        </Paper>
                    </Grid>
                </Grid>
            )}

            {/* Charts */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold">
                            Stock Evolution (Last 7 Days)
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={stockEvolution}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="stock"
                                    stroke="#1976d2"
                                    strokeWidth={2}
                                    name="Total Stock"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold">
                            Most Active Products
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={topProducts}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="count" fill="#2e7d32" name="Movements" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};
