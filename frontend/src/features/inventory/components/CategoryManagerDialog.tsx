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
} from '@mui/material';
import { Delete, Edit, Save, Cancel } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesService } from '../../../api/services/categories';
import type { Category } from '../../../types';

interface Props {
    open: boolean;
    onClose: () => void;
}

export const CategoryManagerDialog = ({ open, onClose }: Props) => {
    const queryClient = useQueryClient();
    const [newCategoryName, setNewCategoryName] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState('');

    const { data: categories = [], isLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: categoriesService.getAll,
    });

    const createMutation = useMutation({
        mutationFn: categoriesService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            setNewCategoryName('');
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, category }: { id: number; category: Category }) =>
            categoriesService.update(id, category),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            setEditingId(null);
            setEditingName('');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: categoriesService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });

    const handleCreate = () => {
        if (!newCategoryName.trim()) return;
        createMutation.mutate({ name: newCategoryName });
    };

    const handleStartEdit = (category: Category) => {
        setEditingId(category.id);
        setEditingName(category.name);
    };

    const handleSaveEdit = () => {
        if (!editingId || !editingName.trim()) return;
        updateMutation.mutate({ id: editingId, category: { id: editingId, name: editingName } });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditingName('');
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Manage Categories</DialogTitle>
            <DialogContent dividers>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField
                        fullWidth
                        size="small"
                        label="New Category Name"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                    />
                    <Button
                        variant="contained"
                        onClick={handleCreate}
                        disabled={!newCategoryName.trim() || createMutation.isPending}
                    >
                        Add
                    </Button>
                </Box>

                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                        {categories.map((category) => (
                            <ListItem key={category.id} divider>
                                {editingId === category.id ? (
                                    <>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            value={editingName}
                                            onChange={(e) => setEditingName(e.target.value)}
                                        />
                                        <ListItemSecondaryAction>
                                            <IconButton edge="end" onClick={handleSaveEdit} color="primary">
                                                <Save />
                                            </IconButton>
                                            <IconButton edge="end" onClick={handleCancelEdit}>
                                                <Cancel />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </>
                                ) : (
                                    <>
                                        <ListItemText primary={category.name} />
                                        <ListItemSecondaryAction>
                                            <IconButton edge="end" onClick={() => handleStartEdit(category)}>
                                                <Edit />
                                            </IconButton>
                                            <IconButton edge="end" onClick={() => deleteMutation.mutate(category.id)} color="error">
                                                <Delete />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </>
                                )}
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
