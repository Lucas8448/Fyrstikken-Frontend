"use client";

import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  Box,
  Typography,
  TextField,
  CircularProgress,
  Alert,
} from "@mui/material";
import { isVotingAllowed, getVotingPeriod } from "@/lib/utils";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

interface VoteProps {
  id: number;
}

export default function Vote({ id }: VoteProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loadingSendMail, setLoadingSendMail] = useState(false);
  const [loadingCode, setLoadingCode] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [votingAllowed, setVotingAllowed] = useState(false);
  const [votingPeriod, setVotingPeriod] = useState<{
    startDate: string;
    endDate: string;
  } | null>(null);

  useEffect(() => {
    const checkVotingStatus = () => {
      const allowed = isVotingAllowed();
      const period = getVotingPeriod();
      setVotingAllowed(allowed);
      setVotingPeriod(period);
    };

    checkVotingStatus();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSendEmail = async () => {
    setLoadingSendMail(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch("/api/access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }), // Assuming 'email' is the data you want to send
      });
      const data = await response.json();
      setLoadingSendMail(false);
      if (response.ok) {
        setSuccess("Verifikasjons kode sendt til din E-post");
      } else {
        setError(
          (await response.text()) || "Vi fikk ikke sendt deg koden din."
        );
      }
    } catch (err) {
      setLoadingSendMail(false);
      setError("Vi fikk ikke sendt deg koden din.");
    }
  };

  const handleVerifyCode = async () => {
    setLoadingCode(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch("/api/access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code }),
      });
      const data = await response.json();
      if (response.ok) {
        const token = data.token;
        await handleVote(token);
      } else {
        setLoadingCode(false);
        setError((await response.text()) || "Noe gikk galt, prøv igjen");
      }
    } catch (err) {
      setLoadingCode(false);
      setError("Noe gikk galt, prøv igjen");
    }
  };

  const handleVote = async (token: string) => {
    try {
      const response = await fetch("/api/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, contestant_id: id }),
      });
      const data = await response.json();
      setLoadingCode(false);
      if (response.ok) {
        setSuccess("Stemme innsendt. Merk at du har nå brukt opp stemmen din.");
      } else {
        setError((await response.text()) || "Noe gikk galt, prøv igjen");
      }
    } catch (err) {
      setLoadingCode(false);
      setError("Noe gikk galt, prøv igjen");
    }
  };

  return (
    <div>
      {votingAllowed ? (
        <Button variant="outlined" className="float-right" onClick={handleOpen}>
          Stem
        </Button>
      ) : (
        <div className="float-right">
          <Button variant="outlined" disabled>
            Stemming ikke tilgjengelig
          </Button>
          {votingPeriod && (
            <Typography
              variant="caption"
              className="block text-center mt-1 text-gray-600"
            >
              Stemmeperiode: {votingPeriod.startDate} til {votingPeriod.endDate}
            </Typography>
          )}
        </div>
      )}
      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          <Typography variant="h6" component="h2">
            Stem for publikums favoritt
          </Typography>
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}
          <TextField
            fullWidth
            label="Skole E-post"
            value={email}
            onChange={(e: any) => setEmail(e.target.value.toLowerCase())}
            margin="normal"
          />
          <Button onClick={handleSendEmail} disabled={loadingSendMail}>
            {loadingSendMail ? <CircularProgress size={24} /> : "Send kode"}
          </Button>
          {success && (
            <>
              <TextField
                fullWidth
                label="Kode fra mail"
                value={code}
                onChange={(e: any) => setCode(e.target.value)}
                margin="normal"
              />
              <Button onClick={handleVerifyCode} disabled={loadingCode}>
                {loadingCode ? (
                  <CircularProgress size={24} />
                ) : (
                  "Send inn stemme"
                )}
              </Button>
            </>
          )}
        </Box>
      </Modal>
    </div>
  );
}
