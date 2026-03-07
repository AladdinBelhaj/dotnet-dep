import { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Stack,
    Typography,
    CircularProgress,
    Alert,
    Box,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { stockService } from '../../../api/services/stock';
import type { Product } from '../../../types';

interface Props {
    open: boolean;
    onClose: () => void;
    product: Product | null;
}

export const StockMovementDialog = ({ open, onClose, product }: Props) => {
    const queryClient = useQueryClient();
    const [type, setType] = useState<'Entry' | 'Exit'>('Entry');
    const [quantity, setQuantity] = useState('');
    const [error, setError] = useState('');

    const movementMutation = useMutation({
        mutationFn: stockService.addMovement,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['movements'] });
            onClose();
            setQuantity('');
            setError('');
        },
        onError: (err: any) => {
            setError(err.response?.data || 'Failed to record movement');
        },
    });

    const handleSubmit = () => {
        if (!product || !quantity) return;
        const qty = Number(quantity);
        if (qty <= 0) return;

        movementMutation.mutate({
            productId: product.id,
            quantity: qty,
            type,
        });
    };

    if (!product) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>Stock Update: {product.name}</DialogTitle>
            <DialogContent dividers>
                <Stack spacing={3}>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <ToggleButtonGroup
                            value={type}
                            exclusive
                            onChange={(_, newVal) => newVal && setType(newVal)}
                        >
                            <ToggleButton value="Entry" color="success">
                                Entry (+)
                            </ToggleButton>
                            <ToggleButton value="Exit" color="error">
                                Exit (-)
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Box>

                    <Typography variant="body2" align="center">
                        Current Stock: <strong>{product.quantity}</strong>
                    </Typography>

                    <TextField
                        label="Quantity"
                        type="number"
                        fullWidth
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        autoFocus
                    />

                    {error && <Alert severity="error">{error}</Alert>}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    variant="contained"
                    color={type === 'Entry' ? 'success' : 'error'}
                    onClick={handleSubmit}
                    disabled={!quantity || Number(quantity) <= 0 || movementMutation.isPending}
                >
                    {movementMutation.isPending ? <CircularProgress size={24} /> : 'Confirm'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
