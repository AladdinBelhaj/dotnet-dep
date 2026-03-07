import { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Alert,
    Paper,
    Grid,
    InputAdornment,
    IconButton,
    useTheme,
    useMediaQuery,
    Stack,
    CircularProgress
} from '@mui/material';
import {
    Person,
    Lock,
    Visibility,
    VisibilityOff,
    Login as LoginIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    // Auth context
    const { login } = useAuth();
    const [localLoading, setLocalLoading] = useState(false);

    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLocalLoading(true);

        try {
            await login(username, password);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data || 'Login failed. Please check your credentials.');
        } finally {
            setLocalLoading(false);
        }
    };

    return (
        <Grid container component="main" sx={{ height: '100vh', overflow: 'hidden' }}>
            {/* Left Side - Hero / Branding (Hidden on mobile) */}
            {!isMobile && (
                <Grid
                    item
                    md={7}
                    lg={8}
                    sx={{
                        backgroundColor: 'primary.main',
                        backgroundImage: 'linear-gradient(135deg, #1976d2 0%, #115293 100%)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: 'white',
                        position: 'relative',
                        p: 4
                    }}
                >
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            opacity: 0.1,
                            backgroundImage: 'radial-gradient(circle at 50% 50%, #ffffff 2px, transparent 2.5px)',
                            backgroundSize: '30px 30px',
                        }}
                    />
                    <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 600 }}>
                        <Typography variant="h2" fontWeight="800" gutterBottom>
                            Welcome Back
                        </Typography>
                        <Typography variant="h5" sx={{ opacity: 0.9 }}>
                            Manage your inventory, users, and reports with efficiency and ease.
                        </Typography>
                    </Box>
                </Grid>
            )}

            {/* Right Side - Login Form */}
            <Grid
                item
                xs={12}
                md={5}
                lg={4}
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'background.default',
                    p: 4,
                }}
            >
                <Paper
                    elevation={0}
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '100%',
                        maxWidth: 400,
                        backgroundColor: 'transparent',
                    }}
                >
                    <Stack spacing={1} alignItems="center" mb={4}>
                        <Box
                            sx={{
                                width: 50,
                                height: 50,
                                borderRadius: '12px',
                                bgcolor: 'primary.main',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mb: 1,
                                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
                            }}
                        >
                            <LoginIcon fontSize="large" />
                        </Box>
                        <Typography component="h1" variant="h4" fontWeight="bold" color="text.primary">
                            Sign In
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Enter your credentials to continue
                        </Typography>
                    </Stack>

                    {error && (
                        <Alert severity="error" sx={{ width: '100%', mb: 3, borderRadius: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="username"
                            label="Username"
                            name="username"
                            autoComplete="username"
                            autoFocus
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Person color="action" />
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: 2 }
                            }}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Lock color="action" />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: 2 }
                            }}
                            sx={{ mb: 4 }}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={localLoading}
                            sx={{
                                py: 1.5,
                                fontSize: '1rem',
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 700,
                                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)',
                                '&:hover': {
                                    boxShadow: '0 6px 16px rgba(25, 118, 210, 0.6)',
                                }
                            }}
                        >
                            {localLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                        </Button>

                        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
                            © {new Date().getFullYear()} InventaPro. All rights reserved.
                        </Typography>
                    </Box>
                </Paper>
            </Grid>
        </Grid>
    );
};
