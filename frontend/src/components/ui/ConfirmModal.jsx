import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import MuiButton from '@mui/material/Button';
import Box from '@mui/material/Box';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const ConfirmModal = ({ title, message, confirmText, cancelText, onConfirm, onCancel, isAlert, variant }) => {
  const isDanger = variant === 'danger';

  return (
    <Dialog
      open
      onClose={isAlert ? onConfirm : onCancel}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '16px',
            padding: '12px 8px 8px',
            boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.05)',
            border: '1px solid #e2e8f0',
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          fontSize: '1.15rem',
          fontWeight: 700,
          color: '#0f172a',
          pb: 1,
        }}
      >
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isDanger ? '#fef2f2' : '#eff6ff',
            color: isDanger ? '#ef4444' : '#2563eb',
            flexShrink: 0,
          }}
        >
          {isDanger ? (
            <WarningAmberIcon sx={{ fontSize: 24 }} />
          ) : (
            <InfoOutlinedIcon sx={{ fontSize: 24 }} />
          )}
        </Box>
        {title}
      </DialogTitle>

      <DialogContent sx={{ pt: 1, pb: 2, pl: 7.2 }}>
        <span style={{ fontSize: '0.925rem', color: '#475569', lineHeight: '1.6' }}>
          {message}
        </span>
      </DialogContent>

      <DialogActions sx={{ px: 2.5, pb: 1.5, gap: 1, justifyContent: 'flex-end' }}>
        {!isAlert && (
          <MuiButton
            variant="contained"
            color="secondary"
            onClick={onCancel}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              backgroundColor: '#f1f5f9',
              color: '#475569',
              border: '1px solid #e2e8f0',
              '&:hover': {
                backgroundColor: '#e2e8f0',
                borderColor: '#cbd5e1',
              },
            }}
          >
            {cancelText || 'Cancel'}
          </MuiButton>
        )}
        <MuiButton
          variant="contained"
          color={isDanger ? 'error' : 'primary'}
          onClick={onConfirm}
          sx={{ textTransform: 'none', fontWeight: 600, px: 2.5 }}
        >
          {confirmText}
        </MuiButton>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmModal;
