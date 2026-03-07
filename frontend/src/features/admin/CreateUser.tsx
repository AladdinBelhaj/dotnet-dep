import { useState } from 'react';
import { Box, TextField, Button, Typography, Alert, Paper, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/axios';
import { ArrowBack } from '@mui/icons-material';

export const CreateUser = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [roleId, setRoleId] = useState(2); // Default to Comptable
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await api.post('/auth/register', { username, password, roleId });
            setSuccess(`User ${username} created successfully!`);
            setUsername('');
            setPassword('');
            setRoleId(2);
        } catch (err: any) {
            setError(err.response?.data || 'Failed to create user.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate('/')}
                sx={{ mb: 2 }}
            >
                Back to Dashboard
            </Button>

            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        p: 4,
                        maxWidth: 500,
                        width: '100%',
                    }}
                >
                    <Typography variant="h5" component="h1" gutterBottom fontWeight="bold">
                        Create New User
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Add a new Administrator or Comptable to the system.
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            {success}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            label="Username"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoComplete="off"
                        />
                        <TextField
                            label="Password"
                            type="password"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="new-password"
                        />

                        <TextField
                            select
                            label="Role"
                            value={roleId}
                            onChange={(e) => setRoleId(Number(e.target.value))}
                            fullWidth
                            margin="normal"
                            variant="outlined"
                        >
                            <MenuItem value={1}>Administrator</MenuItem>
                            <MenuItem value={2}>Comptable</MenuItem>
                        </TextField>

                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                            size="large"
                            disabled={loading}
                            sx={{ mt: 3 }}
                        >
                            {loading ? 'Creating User...' : 'Create User'}
                        </Button>
                    </form>
                </Paper>
            </Box>
        </Box>
    );
};
