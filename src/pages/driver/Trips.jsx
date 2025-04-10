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
  Alert,
  Snackbar
} from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { Add as AddIcon } from '@mui/icons-material'
import { config, formatCurrency, formatDate } from '../../config/config'

const AddTripDialog = ({ open, onClose, onSubmit }) => {
  const [tripData, setTripData] = useState({
    tripAmount: '',
    tripKM: '',
    paymentType: 'cash',
    toll: '',
    cashCollected: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setTripData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = () => {
    onSubmit(tripData)
    setTripData({
      tripAmount: '',
      tripKM: '',
      paymentType: 'cash',
      toll: '',
      cashCollected: ''
    })
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Trip</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            name="tripAmount"
            label="Trip Amount"
            type="number"
            fullWidth
            value={tripData.tripAmount}
            onChange={handleChange}
          />
          <TextField
            name="tripKM"
            label="Trip Distance (KM)"
            type="number"
            fullWidth
            value={tripData.tripKM}
            onChange={handleChange}
          />
          <FormControl fullWidth>
            <InputLabel>Payment Type</InputLabel>
            <Select
              name="paymentType"
              value={tripData.paymentType}
              label="Payment Type"
              onChange={handleChange}
            >
              <MenuItem value="cash">Cash</MenuItem>
              <MenuItem value="online">Online</MenuItem>
            </Select>
          </FormControl>
          <TextField
            name="toll"
            label="Toll Amount (if any)"
            type="number"
            fullWidth
            value={tripData.toll}
            onChange={handleChange}
          />
          {tripData.paymentType === 'cash' && (
            <TextField
              name="cashCollected"
              label="Cash Collected"
              type="number"
              fullWidth
              value={tripData.cashCollected}
              onChange={handleChange}
            />
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Add Trip
        </Button>
      </DialogActions>
    </Dialog>
  )
}

const Trips = () => {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const columns = [
    { 
      field: 'date', 
      headerName: 'Date', 
      width: 180,
      valueFormatter: (params) => formatDate(params.value)
    },
    { 
      field: 'tripAmount', 
      headerName: 'Amount', 
      width: 130,
      valueFormatter: (params) => formatCurrency(params.value)
    },
    { 
      field: 'tripKM', 
      headerName: 'Distance (KM)', 
      width: 130,
      valueFormatter: (params) => `${params.value} km`
    },
    { 
      field: 'paymentType', 
      headerName: 'Payment Type', 
      width: 130,
      valueFormatter: (params) => params.value.charAt(0).toUpperCase() + params.value.slice(1)
    },
    { 
      field: 'toll', 
      headerName: 'Toll', 
      width: 100,
      valueFormatter: (params) => formatCurrency(params.value || 0)
    },
    { 
      field: 'cashCollected', 
      headerName: 'Cash Collected', 
      width: 130,
      valueFormatter: (params) => formatCurrency(params.value || 0)
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 120,
      valueFormatter: (params) => params.value.charAt(0).toUpperCase() + params.value.slice(1)
    }
  ]

  useEffect(() => {
    fetchTrips()
  }, [])

  const fetchTrips = async () => {
    try {
      const response = await fetch(config.API_URL, {
        method: 'POST',
        headers: {
          ...config.HEADERS,
          'Authorization': `Bearer ${localStorage.getItem(config.SESSION.TOKEN_KEY)}`
        },
        body: JSON.stringify({
          action: 'getTrips',
          sessionToken: localStorage.getItem(config.SESSION.TOKEN_KEY)
        })
      })
      const data = await response.json()
      if (data.success) {
        setTrips(data.trips.map((trip, index) => ({
          ...trip,
          id: index
        })))
      }
    } catch (error) {
      console.error('Failed to fetch trips:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddTrip = async (tripData) => {
    try {
      // Validate trip data
      if (!tripData.tripAmount || !tripData.tripKM) {
        setError('Please fill in all required fields')
        return
      }

      if (tripData.tripAmount < config.VALIDATION.TRIP.MIN_AMOUNT || 
          tripData.tripAmount > config.VALIDATION.TRIP.MAX_AMOUNT) {
        setError(`Trip amount must be between ${formatCurrency(config.VALIDATION.TRIP.MIN_AMOUNT)} and ${formatCurrency(config.VALIDATION.TRIP.MAX_AMOUNT)}`)
        return
      }

      if (tripData.tripKM < config.VALIDATION.TRIP.MIN_KM || 
          tripData.tripKM > config.VALIDATION.TRIP.MAX_KM) {
        setError(`Trip distance must be between ${config.VALIDATION.TRIP.MIN_KM}km and ${config.VALIDATION.TRIP.MAX_KM}km`)
        return
      }

      const response = await fetch(config.API_URL, {
        method: 'POST',
        headers: {
          ...config.HEADERS,
          'Authorization': `Bearer ${localStorage.getItem(config.SESSION.TOKEN_KEY)}`
        },
        body: JSON.stringify({
          action: 'addTrip',
          ...tripData,
          date: new Date().toISOString(),
          sessionToken: localStorage.getItem(config.SESSION.TOKEN_KEY)
        })
      })
      const data = await response.json()
      if (data.success) {
        fetchTrips()
        setOpenDialog(false)
      }
    } catch (error) {
      console.error('Failed to add trip:', error)
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Trip Log</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Add Trip
        </Button>
      </Box>

      <Paper sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={trips}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          disableSelectionOnClick
          loading={loading}
        />
      </Paper>

      <AddTripDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSubmit={handleAddTrip}
      />

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
      >
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess('')}
      >
        <Alert severity="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default Trips