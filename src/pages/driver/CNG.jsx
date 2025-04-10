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

const AddCNGDialog = ({ open, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    amount: '',
    paymentType: 'cash',
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
    formDataToSubmit.append('paymentType', formData.paymentType)
    formDataToSubmit.append('image', formData.image)
    formDataToSubmit.append('date', new Date().toISOString())

    onSubmit(formDataToSubmit)
    setFormData({
      amount: '',
      paymentType: 'cash',
      image: null
    })
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add CNG Expense</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            name="amount"
            label="CNG Amount"
            type="number"
            fullWidth
            value={formData.amount}
            onChange={handleChange}
            required
          />
          <FormControl fullWidth required>
            <InputLabel>Payment Type</InputLabel>
            <Select
              name="paymentType"
              value={formData.paymentType}
              label="Payment Type"
              onChange={handleChange}
            >
              <MenuItem value="cash">Cash Collected</MenuItem>
              <MenuItem value="online">Online Payment</MenuItem>
            </Select>
          </FormControl>
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Upload Receipt Image (Required)
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
          disabled={!formData.amount || !formData.image}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  )
}

const CNG = () => {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)

  const columns = [
    { field: 'date', headerName: 'Date', width: 120 },
    { field: 'amount', headerName: 'Amount', width: 120 },
    { field: 'paymentType', headerName: 'Payment Type', width: 150 },
    {
      field: 'receipt',
      headerName: 'Receipt',
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
    fetchExpenses()
  }, [])

  const fetchExpenses = async () => {
    try {
      const response = await fetch('YOUR_GOOGLE_APPS_SCRIPT_URL', {
        method: 'POST',
        body: JSON.stringify({
          action: 'getCNGExpenses'
        })
      })
      const data = await response.json()
      if (data.success) {
        setExpenses(data.expenses.map((expense, index) => ({
          ...expense,
          id: index
        })))
      }
    } catch (error) {
      console.error('Failed to fetch CNG expenses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddExpense = async (formData) => {
    try {
      const response = await fetch('YOUR_GOOGLE_APPS_SCRIPT_URL', {
        method: 'POST',
        body: formData
      })
      const data = await response.json()
      if (data.success) {
        fetchExpenses()
        setOpenDialog(false)
      }
    } catch (error) {
      console.error('Failed to add CNG expense:', error)
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">CNG Expenses</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Add Expense
        </Button>
      </Box>

      <Paper sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={expenses}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          disableSelectionOnClick
          loading={loading}
        />
      </Paper>

      <AddCNGDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSubmit={handleAddExpense}
      />
    </Box>
  )
}

export default CNG