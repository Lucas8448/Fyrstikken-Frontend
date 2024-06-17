"use client";

import React, { useState } from 'react';
import { Button, Modal, Box, Typography, TextField, CircularProgress, Alert } from '@mui/material';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

interface VoteProps {
    id: number;
}

export default function Vote({ id }: VoteProps) {
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [loadingSendMail, setLoadingSendMail] = useState(false);
    const [loadingCode, setLoadingCode] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleSendEmail = async () => {
        setLoadingSendMail(true);
        setError('');
        setSuccess('');
        try {
            const response = await fetch('https://48.217.160.194:5000/access', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            setLoadingSendMail(false);
            if (response.ok) {
                setSuccess('Verifikasjons kode sendt til din E-post');
            } else {
                setError(data.message || 'Vi fikk ikke sendt deg koden din.');
            }
        } catch (err) {
            setLoadingSendMail(false);
            setError('Vi fikk ikke sendt deg koden din.');
        }
    };

    const handleVerifyCode = async () => {
        setLoadingCode(true);
        setError('');
        setSuccess('');
        try {
            const response = await fetch('https://48.217.160.194:5000/access', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, code }),
            });
            const data = await response.json();
            if (response.ok) {
                const token = data.token;
                await handleVote(token);
            } else {
                setLoadingCode(false);
                setError(data.message || 'Noe gikk galt, prøv igjen');
            }
        } catch (err) {
            setLoadingCode(false);
            setError('Noe gikk galt, prøv igjen');
        }
    };

    const handleVote = async (token: string) => {
        try {
            const response = await fetch('https://48.217.160.194:5000/vote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token, contestant_id: id }),
            });
            const data = await response.json();
            setLoadingCode(false);
            if (response.ok) {
                setSuccess('Stemme innsendt');
            } else {
                setError(data.message || 'Noe gikk galt, prøv igjen');
            }
        } catch (err) {
            setLoadingCode(false);
            setError('Noe gikk galt, prøv igjen');
        }
    };

    return (
        <div>
            <Button variant="outlined" className="float-right" onClick={handleOpen}>Stem</Button>
            <Modal open={open} onClose={handleClose}>
                <Box sx={style}>
                    <Typography variant="h6" component="h2">Stem for publikums favoritt</Typography>
                    {error && <Alert severity="error">{error}</Alert>}
                    {success && <Alert severity="success">{success}</Alert>}
                    <TextField
                        fullWidth
                        label="Skole E-post"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        margin="normal"
                    />
                    <Button onClick={handleSendEmail} disabled={loadingSendMail}>
                        {loadingSendMail ? <CircularProgress size={24} /> : 'Send kode'}
                    </Button>
                    {success && (
                        <>
                            <TextField
                                fullWidth
                                label="Kode fra mail"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                margin="normal"
                            />
                            <Button onClick={handleVerifyCode} disabled={loadingCode}>
                                {loadingCode ? <CircularProgress size={24} /> : 'Submit Vote'}
                            </Button>
                        </>
                    )}
                </Box>
            </Modal>
        </div>
    );
}