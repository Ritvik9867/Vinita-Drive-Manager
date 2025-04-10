import { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
} from '@mui/material'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

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
  const [stats, setStats] = useState({
    totalEarnings: 0,
    totalExpenses: 0,
    activeDrivers: 0,
    pendingApprovals: 0,
    totalComplaints: 0
  })
  const [selectedDriver, setSelectedDriver] = useState('all')
  const [drivers, setDrivers] = useState([])
  const [earningsData, setEarningsData] = useState([])
  const [performanceData, setPerformanceData] = useState([])

  useEffect(() => {
    fetchDashboardData()
    fetchDrivers()
  }, [])

  useEffect(() => {
    fetchDriverStats()
  }, [selectedDriver])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('YOUR_GOOGLE_APPS_SCRIPT_URL', {
        method: 'POST',
        body: JSON.stringify({
          action: 'getAdminDashboardData'
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

  const fetchDrivers = async () => {
    try {
      const response = await fetch('YOUR_GOOGLE_APPS_SCRIPT_URL', {
        method: 'POST',
        body: JSON.stringify({
          action: 'getDriversList'
        })
      })
      const data = await response.json()
      if (data.success) {
        setDrivers(data.drivers)
      }
    } catch (error) {
      console.error('Failed to fetch drivers:', error)
    }
  }

  const fetchDriverStats = async () => {
    if (selectedDriver === 'all') {
      return
    }

    try {
      const response = await fetch('YOUR_GOOGLE_APPS_SCRIPT_URL', {
        method: 'POST',
        body: JSON.stringify({
          action: 'getDriverPerformance',
          driverId: selectedDriver
        })
      })
      const data = await response.json()
      if (data.success) {
        setPerformanceData(data.performanceData)
      }
    } catch (error) {
      console.error('Failed to fetch driver stats:', error)
    }
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Total Earnings"
            value={stats.totalEarnings}
            unit="₹"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Total Expenses"
            value={stats.totalExpenses}
            unit="₹"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Active Drivers"
            value={stats.activeDrivers}
            unit="drivers"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Pending Approvals"
            value={stats.pendingApprovals}
            unit="items"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Total Complaints"
            value={stats.totalComplaints}
            unit="complaints"
          />
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Company Earnings Overview
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

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">
                Driver Performance
              </Typography>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Select Driver</InputLabel>
                <Select
                  value={selectedDriver}
                  label="Select Driver"
                  onChange={(e) => setSelectedDriver(e.target.value)}
                >
                  <MenuItem value="all">All Drivers</MenuItem>
                  {drivers.map((driver) => (
                    <MenuItem key={driver.id} value={driver.id}>
                      {driver.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            {selectedDriver !== 'all' && (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="earnings"
                    stroke="#8884d8"
                    name="Earnings"
                  />
                  <Line
                    type="monotone"
                    dataKey="trips"
                    stroke="#82ca9d"
                    name="Trips"
                  />
                  <Line
                    type="monotone"
                    dataKey="complaints"
                    stroke="#ff7300"
                    name="Complaints"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Dashboard