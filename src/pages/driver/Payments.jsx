import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Typography,
} from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { Add as AddIcon } from '@mui/icons-material'

const AddPaymentDialog = ({ open, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    amount: '',
    type: 'advance_return',
    description: '',
    image: null
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageChange = (e) => {
    if (e.target.files?.[0]) {
      setFormData(prev => ({
        ...prev,
        image: e.target.files[0]
      }))
    }
  }

  const handleSubmit = () => {
    const formDataToSubmit = new FormData()
    formDataToSubmit.append('amount', formData.amount)
    formDataToSubmit.append('type', formData.type)
    formDataToSubmit.append('description', formData.description)
    formDataToSubmit.append('image', formData.image)
    formDataToSubmit.append('date', new Date().toISOString())

    onSubmit(formDataToSubmit)
    setFormData({
      amount: '',
      type: 'advance_return',
      description: '',
      image: null
    })
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Payment</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            name="amount"
            label="Amount"
            type="number"
            fullWidth
            value={formData.amount}
            onChange={handleChange}
            required
          />
          <FormControl fullWidth required>
            <InputLabel>Payment Type</InputLabel>
            <Select
              name="type"
              value={formData.type}
              label="Payment Type"
              onChange={handleChange}
            >
              <MenuItem value="advance_return">Advance Return</MenuItem>
              <MenuItem value="advance_received">Advance Received</MenuItem>
            </Select>
          </FormControl>
          <TextField
            name="description"
            label="Description"
            multiline
            rows={2}
            fullWidth
            value={formData.description}
            onChange={handleChange}
            required
          />
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Upload Payment Screenshot
            </Typography>
            <input
              accept="image/*"
              type="file"
              onChange={handleImageChange}
              required
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!formData.amount || !formData.description || !formData.image}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  )
}

const Payments = () => {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [balance, setBalance] = useState(0)

  const columns = [
    { field: 'date', headerName: 'Date', width: 120 },
    { field: 'amount', headerName: 'Amount', width: 120 },
    {
      field: 'type',
      headerName: 'Type',
      width: 150,
      valueGetter: (params) =>
        params.value === 'advance_return' ? 'Advance Return' : 'Advance Received',
    },
    { field: 'description', headerName: 'Description', width: 200 },
    {
      field: 'proof',
      headerName: 'Payment Proof',
      width: 120,
      renderCell: (params) => (
        <Button
          size="small"
          onClick={() => window.open(params.value, '_blank')}
        >
          View
        </Button>
      ),
    },
    { field: 'status', headerName: 'Status', width: 120 },
  ]

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      const response = await fetch('YOUR_GOOGLE_APPS_SCRIPT_URL', {
        method: 'POST',
        body: JSON.stringify({
          action: 'getPayments'
        })
      })
      const data = await response.json()
      if (data.success) {
        setPayments(data.payments.map((payment, index) => ({
          ...payment,
          id: index
        })))
        setBalance(data.balance)
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddPayment = async (formData) => {
    try {
      const response = await fetch('YOUR_GOOGLE_APPS_SCRIPT_URL', {
        method: 'POST',
        body: formData
      })
      const data = await response.json()
      if (data.success) {
        fetchPayments()
        setOpenDialog(false)
      }
    } catch (error) {
      console.error('Failed to add payment:', error)
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h4">Payments</Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Current Balance: ₹{balance}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Add Payment
        </Button>
      </Box>

      <Paper sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={payments}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          disableSelectionOnClick
          loading={loading}
        />
      </Paper>

      <AddPaymentDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSubmit={handleAddPayment}
      />
    </Box>
  )
}

export default Payments