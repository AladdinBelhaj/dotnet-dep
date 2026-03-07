import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Stack,
    CircularProgress,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsService } from '../../../api/services/products';
import { categoriesService } from '../../../api/services/categories';
import { suppliersService } from '../../../api/services/suppliers';
import type { Product } from '../../../types';

interface Props {
    open: boolean;
    onClose: () => void;
    productToEdit?: Product | null;
}

export const ProductFormDialog = ({ open, onClose, productToEdit }: Props) => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        name: '',
        reference: '',
        quantity: 0,
        price: 0,
        minStock: 0,
        categoryId: '',
        supplierId: '',
    });

    useEffect(() => {
        if (productToEdit) {
            setFormData({
                name: productToEdit.name,
                reference: productToEdit.reference,
                quantity: productToEdit.quantity,
                price: productToEdit.price,
                minStock: productToEdit.minStock,
                categoryId: String(productToEdit.categoryId),
                supplierId: String(productToEdit.supplierId),
            });
        } else {
            setFormData({
                name: '',
                reference: '',
                quantity: 0,
                price: 0,
                minStock: 0,
                categoryId: '',
                supplierId: '',
            });
        }
    }, [productToEdit, open]);

    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: categoriesService.getAll,
    });

    const { data: suppliers = [] } = useQuery({
        queryKey: ['suppliers'],
        queryFn: suppliersService.getAll,
    });

    const createMutation = useMutation({
        mutationFn: productsService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            onClose();
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, product }: { id: number; product: any }) =>
            productsService.update(id, product),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            onClose();
        },
    });

    const handleSubmit = () => {
        const payload = {
            name: formData.name,
            reference: formData.reference,
            quantity: Number(formData.quantity),
            price: Number(formData.price),
            minStock: Number(formData.minStock),
            categoryId: Number(formData.categoryId),
            supplierId: Number(formData.supplierId),
        };

        if (productToEdit) {
            updateMutation.mutate({ id: productToEdit.id, product: { ...payload, id: productToEdit.id } });
        } else {
            createMutation.mutate(payload);
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending;
    const isValid = formData.name && formData.categoryId && formData.supplierId;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{productToEdit ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2}>
                    <TextField
                        label="Product Name"
                        fullWidth
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    <TextField
                        label="Reference"
                        fullWidth
                        value={formData.reference}
                        onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    />
                    <Stack direction="row" spacing={2}>
                        <TextField
                            label="Initial Quantity"
                            type="number"
                            fullWidth
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                            disabled={!!productToEdit} // Usually stock is managed via movements
                        />
                        <TextField
                            label="Min Stock Alert"
                            type="number"
                            fullWidth
                            value={formData.minStock}
                            onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
                        />
                    </Stack>
                    <TextField
                        label="Price"
                        type="number"
                        fullWidth
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    />
                    <TextField
                        select
                        label="Category"
                        fullWidth
                        value={formData.categoryId}
                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    >
                        {categories.map((cat) => (
                            <MenuItem key={cat.id} value={cat.id}>
                                {cat.name}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        select
                        label="Supplier"
                        fullWidth
                        value={formData.supplierId}
                        onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                    >
                        {suppliers.map((sup) => (
                            <MenuItem key={sup.id} value={sup.id}>
                                {sup.name}
                            </MenuItem>
                        ))}
                    </TextField>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" onClick={handleSubmit} disabled={!isValid || isPending}>
                    {isPending ? <CircularProgress size={24} /> : 'Save'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
