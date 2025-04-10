import { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  TextField,
} from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { Download as DownloadIcon } from '@mui/icons-material'

const Reports = () => {
  const [reportType, setReportType] = useState('earnings')
  const [timeFrame, setTimeFrame] = useState('daily')
  const [driverId, setDriverId] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState([])
  const [drivers, setDrivers] = useState([])

  const reportTypes = [
    { value: 'earnings', label: 'Earnings Report' },
    { value: 'expenses', label: 'Expenses Report' },
    { value: 'trips', label: 'Trips Report' },
    { value: 'complaints', label: 'Complaints Report' },
    { value: 'performance', label: 'Driver Performance Report' },
  ]

  const timeFrames = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
    { value: 'custom', label: 'Custom Range' },
  ]

  const columns = {
    earnings: [
      { field: 'date', headerName: 'Date', width: 120 },
      { field: 'driverName', headerName: 'Driver', width: 150 },
      { field: 'trips', headerName: 'Total Trips', width: 120 },
      { field: 'earnings', headerName: 'Total Earnings', width: 150 },
      { field: 'cashCollected', headerName: 'Cash Collected', width: 150 },
      { field: 'onlinePayments', headerName: 'Online Payments', width: 150 },
    ],
    expenses: [
      { field: 'date', headerName: 'Date', width: 120 },
      { field: 'driverName', headerName: 'Driver', width: 150 },
      { field: 'cngAmount', headerName: 'CNG Amount', width: 150 },
      { field: 'tollCharges', headerName: 'Toll Charges', width: 150 },
      { field: 'otherExpenses', headerName: 'Other Expenses', width: 150 },
      { field: 'total', headerName: 'Total Expenses', width: 150 },
    ],
    trips: [
      { field: 'date', headerName: 'Date', width: 120 },
      { field: 'driverName', headerName: 'Driver', width: 150 },
      { field: 'startOD', headerName: 'Start OD', width: 120 },
      { field: 'endOD', headerName: 'End OD', width: 120 },
      { field: 'totalKM', headerName: 'Total KM', width: 120 },
      { field: 'burningKM', headerName: 'Burning KM', width: 120 },
    ],
    complaints: [
      { field: 'date', headerName: 'Date', width: 120 },
      { field: 'from', headerName: 'From', width: 150 },
      { field: 'against', headerName: 'Against', width: 150 },
      { field: 'type', headerName: 'Type', width: 150 },
      { field: 'status', headerName: 'Status', width: 120 },
    ],
    performance: [
      { field: 'date', headerName: 'Date', width: 120 },
      { field: 'driverName', headerName: 'Driver', width: 150 },
      { field: 'totalTrips', headerName: 'Total Trips', width: 120 },
      { field: 'workingHours', headerName: 'Working Hours', width: 150 },
      { field: 'efficiency', headerName: 'Efficiency', width: 120 },
      { field: 'complaints', headerName: 'Complaints', width: 120 },
    ],
  }

  const fetchReport = async () => {
    setLoading(true)
    try {
      const response = await fetch('YOUR_GOOGLE_APPS_SCRIPT_URL', {
        method: 'POST',
        body: JSON.stringify({
          action: 'generateReport',
          reportType,
          timeFrame,
          driverId,
          startDate: timeFrame === 'custom' ? startDate : undefined,
          endDate: timeFrame === 'custom' ? endDate : undefined,
        })
      })
      const data = await response.json()
      if (data.success) {
        setReportData(data.reportData.map((item, index) => ({
          ...item,
          id: index
        })))
      }
    } catch (error) {
      console.error('Failed to fetch report:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportReport = async () => {
    try {
      const response = await fetch('YOUR_GOOGLE_APPS_SCRIPT_URL', {
        method: 'POST',
        body: JSON.stringify({
          action: 'exportReport',
          reportType,
          timeFrame,
          driverId,
          startDate: timeFrame === 'custom' ? startDate : undefined,
          endDate: timeFrame === 'custom' ? endDate : undefined,
        })
      })
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${reportType}_report.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export report:', error)
    }
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Reports
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Report Type</InputLabel>
              <Select
                value={reportType}
                label="Report Type"
                onChange={(e) => setReportType(e.target.value)}
              >
                {reportTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Time Frame</InputLabel>
              <Select
                value={timeFrame}
                label="Time Frame"
                onChange={(e) => setTimeFrame(e.target.value)}
              >
                {timeFrames.map((frame) => (
                  <MenuItem key={frame.value} value={frame.value}>
                    {frame.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Driver</InputLabel>
              <Select
                value={driverId}
                label="Driver"
                onChange={(e) => setDriverId(e.target.value)}
              >
                <MenuItem value="all">All Drivers</MenuItem>
                {drivers.map((driver) => (
                  <MenuItem key={driver.id} value={driver.id}>
                    {driver.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {timeFrame === 'custom' && (
            <>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </>
          )}

          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              onClick={fetchReport}
              fullWidth
              disabled={loading}
            >
              Generate Report
            </Button>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={exportReport}
              fullWidth
              disabled={loading || reportData.length === 0}
            >
              Export Report
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={reportData}
          columns={columns[reportType]}
          pageSize={5}
          rowsPerPageOptions={[5]}
          disableSelectionOnClick
          loading={loading}
        />
      </Paper>
    </Box>
  )
}

export default Reports