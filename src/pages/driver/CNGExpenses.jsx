import { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
} from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { Add as AddIcon } from '@mui/icons-material'
import { useAuth } from '../../contexts/AuthContext'
import { config, formatCurrency, formatDate } from '../../config/config'

const CNGExpenses = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [expenses, setExpenses] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    amount: '',
    paidBy: 'cash',
    receipt: null
  })

  const columns = [
    { field: 'date', headerName: 'Date', width: 180,
      valueFormatter: (params) => formatDate(params.value) },
    { field: 'amount', headerName: 'Amount', width: 130,
      valueFormatter: (params) => formatCurrency(params.value) },
    { field: 'paidBy', headerName: 'Paid By', width: 130 },
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
    { field: 'status', headerName: 'Status', width: 130 }
  ]

  useEffect(() => {
    fetchExpenses()
  }, [])

  const fetchExpenses = async () => {
    try {
      const response = await fetch(config.API_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'getCNGExpenses',
          driver: user.name
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
      console.error('Failed to fetch expenses:', error)
    }
  }

  const handleImageChange = (event) => {
    if (event.target.files?.[0]) {
      // Validate file size
      if (event.target.files[0].size > config.IMAGE_UPLOAD.MAX_SIZE) {
        setError('Receipt image size should be less than 5MB')
        return
      }

      // Validate file type
      if (!config.IMAGE_UPLOAD.ALLOWED_TYPES.includes(event.target.files[0].type)) {
        setError('Only JPEG and PNG images are allowed')
        return
      }

      setFormData(prev => ({
        ...prev,
        receipt: event.target.files[0]
      }))
      setError('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.amount || !formData.receipt) {
      setError('Please fill all required fields')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const submitData = new FormData()
      submitData.append('action', 'addCNGExpense')
      submitData.append('driver', user.name)
      submitData.append('amount', formData.amount)
      submitData.append('paidBy', formData.paidBy)
      submitData.append('receipt', formData.receipt)
      submitData.append('date', new Date().toISOString())

      const response = await fetch(config.API_URL, {
        method: 'POST',
        body: submitData
      })

      const data = await response.json()
      if (data.success) {
        setSuccess('CNG expense submitted successfully')
        setFormData({
          amount: '',
          paidBy: 'cash',
          receipt: null
        })
        setShowAddForm(false)
        fetchExpenses()
      } else {
        setError(data.error || 'Failed to submit expense')
      }
    } catch (error) {
      console.error('Failed to submit expense:', error)
      setError('Failed to submit expense. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">CNG Expenses</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowAddForm(true)}
          disabled={showAddForm}
        >
          Add Expense
        </Button>
      </Box>

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

      {showAddForm && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Add New CNG Expense
          </Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Paid By</InputLabel>
                  <Select
                    value={formData.paidBy}
                    label="Paid By"
                    onChange={(e) => setFormData(prev => ({ ...prev, paidBy: e.target.value }))}
                  >
                    <MenuItem value="cash">Cash Collected</MenuItem>
                    <MenuItem value="online">Online</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <input
                  accept="image/*"
                  type="file"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                  id="receipt-upload"
                  required
                />
                <label htmlFor="receipt-upload">
                  <Button variant="outlined" component="span">
                    Upload Receipt Image
                  </Button>
                </label>
                {formData.receipt && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Selected: {formData.receipt.name}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Submit'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setShowAddForm(false)
                      setFormData({
                        amount: '',
                        paidBy: 'cash',
                        receipt: null
                      })
                    }}
                  >
                    Cancel
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      )}

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
    </Box>
  )
}

export default CNGExpenses