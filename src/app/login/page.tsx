"use client";

import { signInAction } from "@/actions/auth-actions";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { useActionState } from "react";

function LoginForm() {
  const [error, action, pending] = useActionState<string | null, FormData>(
    async (_, formData) => {
      try {
        await signInAction(formData);
        return null;
      } catch (error) {
        if (isRedirectError(error)) {
          window.location.href = "/";
          return null;
        }
        return "Invalid password. Please try again.";
      }
    },
    null,
  );

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: "100%" }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mb: 3,
            }}
          >
            <LockOutlinedIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="h5" fontWeight={600}>
              Trading Journal
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Enter your password to continue
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" action={action}>
            <TextField
              name="password"
              label="Password"
              type="password"
              fullWidth
              required
              autoFocus
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      {pending && <CircularProgress size={20} />}
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ mb: 2 }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={pending}
            >
              Sign in
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default function LoginPage() {
  return <LoginForm />;
}
