import { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
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

const DriverDetailsDialog = ({ open, onClose, driverId }) => {
  const [driverDetails, setDriverDetails] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (driverId) {
      fetchDriverDetails()
    }
  }, [driverId])

  const fetchDriverDetails = async () => {
    try {
      const response = await fetch('YOUR_GOOGLE_APPS_SCRIPT_URL', {
        method: 'POST',
        body: JSON.stringify({
          action: 'getDriverDetails',
          driverId
        })
      })
      const data = await response.json()
      if (data.success) {
        setDriverDetails(data.details)
      }
    } catch (error) {
      console.error('Failed to fetch driver details:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!driverDetails) {
    return null
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Driver Details</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>{driverDetails.name}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Email</TableCell>
                      <TableCell>{driverDetails.email}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Join Date</TableCell>
                      <TableCell>{driverDetails.joinDate}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Performance Metrics
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell>Total Trips</TableCell>
                      <TableCell>{driverDetails.totalTrips}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Average Rating</TableCell>
                      <TableCell>{driverDetails.averageRating}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Complaints</TableCell>
                      <TableCell>{driverDetails.complaints}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={driverDetails.activityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="trips" fill="#8884d8" name="Trips" />
                  <Bar dataKey="hours" fill="#82ca9d" name="Working Hours" />
                </BarChart>
              </ResponsiveContainer>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}

const Drivers = () => {
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDriver, setSelectedDriver] = useState(null)

  const columns = [
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'status', headerName: 'Status', width: 120 },
    { field: 'totalTrips', headerName: 'Total Trips', width: 120 },
    { field: 'totalEarnings', headerName: 'Total Earnings', width: 150 },
    { field: 'lastActive', headerName: 'Last Active', width: 150 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
        <Button
          variant="outlined"
          size="small"
          onClick={() => setSelectedDriver(params.row.id)}
        >
          View Details
        </Button>
      ),
    },
  ]

  useEffect(() => {
    fetchDrivers()
  }, [])

  const fetchDrivers = async () => {
    try {
      const response = await fetch('YOUR_GOOGLE_APPS_SCRIPT_URL', {
        method: 'POST',
        body: JSON.stringify({
          action: 'getAllDrivers'
        })
      })
      const data = await response.json()
      if (data.success) {
        setDrivers(data.drivers.map((driver, index) => ({
          ...driver,
          id: driver.id || index
        })))
      }
    } catch (error) {
      console.error('Failed to fetch drivers:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Drivers Management
      </Typography>

      <Paper sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={drivers}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          disableSelectionOnClick
          loading={loading}
        />
      </Paper>

      <DriverDetailsDialog
        open={Boolean(selectedDriver)}
        onClose={() => setSelectedDriver(null)}
        driverId={selectedDriver}
      />
    </Box>
  )
}

export default Drivers