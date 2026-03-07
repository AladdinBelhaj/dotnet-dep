import React from 'react';
import { Paper, Typography, Box } from '@mui/material';


interface KPICardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    trend?: string;
}

export const KPICard: React.FC<KPICardProps> = ({ title, value, icon, color, trend }) => {
    return (
        <Paper
            sx={{
                p: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                height: '100%',
            }}
        >
            <Box
                sx={{
                    backgroundColor: color,
                    borderRadius: 2,
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                }}
            >
                {icon}
            </Box>
            <Box sx={{ flex: 1 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    {title}
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                    {value}
                </Typography>
                {trend && (
                    <Typography variant="caption" color="success.main">
                        {trend}
                    </Typography>
                )}
            </Box>
        </Paper>
    );
};
