import { useState, useEffect } from 'react'
import { config } from '../../config/config'
import {
  Box,
  Grid,
  Paper,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Card,
  CardContent,
} from '@mui/material'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const ODReadingDialog = ({ open, onClose }) => {
  const [startOD, setStartOD] = useState('')
  const [image, setImage] = useState(null)

  const handleSubmit = async () => {
    try {
      const formData = new FormData()
      formData.append('action', 'submitODReading')
      formData.append('startOD', startOD)
      formData.append('image', image)
      formData.append('timestamp', new Date().toISOString())

      const response = await fetch(config.API_URL, {
        method: 'POST',
        body: formData,
        headers: {
          ...config.HEADERS,
          'Authorization': `Bearer ${localStorage.getItem(config.SESSION.TOKEN_KEY)}`
        }
      })

      const data = await response.json()
      if (data.success) {
        onClose()
      }
    } catch (error) {
      console.error('Failed to submit OD reading:', error)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Start OD Reading</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Start OD Reading"
            type="number"
            value={startOD}
            onChange={(e) => setStartOD(e.target.value)}
            sx={{ mb: 2 }}
          />
          <input
            accept="image/*"
            type="file"
            onChange={(e) => setImage(e.target.files[0])}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  )
}

const StatCard = ({ title, value, unit }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Typography color="textSecondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h4" component="div">
        {value}
        <Typography variant="body2" component="span" sx={{ ml: 1 }}>
          {unit}
        </Typography>
      </Typography>
    </CardContent>
  </Card>
)

const Dashboard = () => {
  const [showODDialog, setShowODDialog] = useState(false)
  const [stats, setStats] = useState({
    totalEarnings: 0,
    totalExpenses: 0,
    cashCollected: 0,
    onlinePayments: 0,
    totalDriven: 0,
    inTripKM: 0,
    burningKM: 0
  })
  const [earningsData, setEarningsData] = useState([])

  useEffect(() => {
    const checkODReading = async () => {
      try {
        const response = await fetch(config.API_URL, {
          method: 'POST',
          headers: config.HEADERS,
          body: JSON.stringify({
            action: 'checkODReading',
            sessionToken: localStorage.getItem(config.SESSION.TOKEN_KEY)
          })
        })
        const data = await response.json()
        if (!data.hasODReading) {
          setShowODDialog(true)
        }
      } catch (error) {
        console.error('Failed to check OD reading:', error)
      }
    }

    const fetchDashboardData = async () => {
      try {
        const response = await fetch(config.API_URL, {
          method: 'POST',
          headers: config.HEADERS,
          body: JSON.stringify({
            action: 'getDashboardData',
            sessionToken: localStorage.getItem(config.SESSION.TOKEN_KEY)
          })
        })
        const data = await response.json()
        if (data.success) {
          setStats(data.stats)
          setEarningsData(data.earningsData)
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      }
    }

    checkODReading()
    fetchDashboardData()
  }, [])

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Earnings"
            value={stats.totalEarnings}
            unit="₹"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Expenses"
            value={stats.totalExpenses}
            unit="₹"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Cash Collected"
            value={stats.cashCollected}
            unit="₹"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Online Payments"
            value={stats.onlinePayments}
            unit="₹"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Distance Driven"
            value={stats.totalDriven}
            unit="km"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="In-Trip Distance"
            value={stats.inTripKM}
            unit="km"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Burning Distance"
            value={stats.burningKM}
            unit="km"
          />
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Earnings Overview
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={earningsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="earnings" fill="#8884d8" name="Earnings" />
                <Bar dataKey="expenses" fill="#82ca9d" name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      <ODReadingDialog
        open={showODDialog}
        onClose={() => setShowODDialog(false)}
      />
    </Box>
  )
}

export default Dashboard