import { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    TextField,
    Box,
    CircularProgress,
    Stack,
} from '@mui/material';
import { Delete, Edit, Save, Cancel } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { suppliersService } from '../../../api/services/suppliers';
import type { Supplier } from '../../../types';

interface Props {
    open: boolean;
    onClose: () => void;
}

export const SupplierManagerDialog = ({ open, onClose }: Props) => {
    const queryClient = useQueryClient();
    const [newSupplier, setNewSupplier] = useState({ name: '', contactInfo: '' });
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

    const { data: suppliers = [], isLoading } = useQuery({
        queryKey: ['suppliers'],
        queryFn: suppliersService.getAll,
    });

    const createMutation = useMutation({
        mutationFn: suppliersService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['suppliers'] });
            setNewSupplier({ name: '', contactInfo: '' });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, supplier }: { id: number; supplier: Supplier }) =>
            suppliersService.update(id, supplier),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['suppliers'] });
            setEditingId(null);
            setEditingSupplier(null);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: suppliersService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['suppliers'] });
        },
    });

    const handleCreate = () => {
        if (!newSupplier.name.trim()) return;
        createMutation.mutate(newSupplier as any); // Type assertion needed until backend matches strict type, or simple omit
    };

    const handleStartEdit = (supplier: Supplier) => {
        setEditingId(supplier.id);
        setEditingSupplier({ ...supplier });
    };

    const handleSaveEdit = () => {
        if (!editingId || !editingSupplier) return;
        updateMutation.mutate({ id: editingId, supplier: editingSupplier });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditingSupplier(null);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Manage Suppliers</DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2} sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Name"
                            value={newSupplier.name}
                            onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                        />
                        <TextField
                            fullWidth
                            size="small"
                            label="Contact Info"
                            value={newSupplier.contactInfo}
                            onChange={(e) => setNewSupplier({ ...newSupplier, contactInfo: e.target.value })}
                        />
                        <Button
                            variant="contained"
                            onClick={handleCreate}
                            disabled={!newSupplier.name.trim() || createMutation.isPending}
                        >
                            Add
                        </Button>
                    </Box>
                </Stack>

                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                        {suppliers.map((supplier) => (
                            <ListItem key={supplier.id} divider alignItems="flex-start">
                                {editingId === supplier.id && editingSupplier ? (
                                    <Stack direction="row" spacing={1} sx={{ width: '100%', mr: 1 }}>
                                        <TextField
                                            size="small"
                                            value={editingSupplier.name}
                                            onChange={(e) => setEditingSupplier({ ...editingSupplier, name: e.target.value })}
                                        />
                                        <TextField
                                            size="small"
                                            value={editingSupplier.contactInfo}
                                            onChange={(e) => setEditingSupplier({ ...editingSupplier, contactInfo: e.target.value })}
                                        />
                                    </Stack>
                                ) : (
                                    <ListItemText
                                        primary={supplier.name}
                                        secondary={supplier.contactInfo}
                                    />
                                )}
                                <ListItemSecondaryAction>
                                    {editingId === supplier.id ? (
                                        <>
                                            <IconButton edge="end" onClick={handleSaveEdit} color="primary">
                                                <Save />
                                            </IconButton>
                                            <IconButton edge="end" onClick={handleCancelEdit}>
                                                <Cancel />
                                            </IconButton>
                                        </>
                                    ) : (
                                        <>
                                            <IconButton edge="end" onClick={() => handleStartEdit(supplier)}>
                                                <Edit />
                                            </IconButton>
                                            <IconButton edge="end" onClick={() => deleteMutation.mutate(supplier.id)} color="error">
                                                <Delete />
                                            </IconButton>
                                        </>
                                    )}
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))}
                    </List>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};
