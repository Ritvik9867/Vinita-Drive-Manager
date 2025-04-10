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

const complaintTypes = [
  'Dirty Car',
  'Vehicle Damage',
  'Maintenance Issue',
  'Behavior',
  'Other'
]

const AddComplaintDialog = ({ open, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    against: '',
    type: '',
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
    formDataToSubmit.append('against', formData.against)
    formDataToSubmit.append('type', formData.type)
    formDataToSubmit.append('description', formData.description)
    formDataToSubmit.append('image', formData.image)
    formDataToSubmit.append('date', new Date().toISOString())

    onSubmit(formDataToSubmit)
    setFormData({
      against: '',
      type: '',
      description: '',
      image: null
    })
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>File Complaint</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            name="against"
            label="Driver Name"
            fullWidth
            value={formData.against}
            onChange={handleChange}
            required
          />
          <FormControl fullWidth required>
            <InputLabel>Complaint Type</InputLabel>
            <Select
              name="type"
              value={formData.type}
              label="Complaint Type"
              onChange={handleChange}
            >
              {complaintTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            name="description"
            label="Description"
            multiline
            rows={4}
            fullWidth
            value={formData.description}
            onChange={handleChange}
            required
          />
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Upload Image Proof
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
          disabled={!formData.against || !formData.type || !formData.description || !formData.image}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  )
}

const Complaints = () => {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)

  const columns = [
    { field: 'date', headerName: 'Date', width: 120 },
    { field: 'against', headerName: 'Against', width: 150 },
    { field: 'type', headerName: 'Type', width: 150 },
    { field: 'description', headerName: 'Description', width: 200 },
    {
      field: 'proof',
      headerName: 'Image Proof',
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
    fetchComplaints()
  }, [])

  const fetchComplaints = async () => {
    try {
      const response = await fetch('YOUR_GOOGLE_APPS_SCRIPT_URL', {
        method: 'POST',
        body: JSON.stringify({
          action: 'getComplaints'
        })
      })
      const data = await response.json()
      if (data.success) {
        setComplaints(data.complaints.map((complaint, index) => ({
          ...complaint,
          id: index
        })))
      }
    } catch (error) {
      console.error('Failed to fetch complaints:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddComplaint = async (formData) => {
    try {
      const response = await fetch('YOUR_GOOGLE_APPS_SCRIPT_URL', {
        method: 'POST',
        body: formData
      })
      const data = await response.json()
      if (data.success) {
        fetchComplaints()
        setOpenDialog(false)
      }
    } catch (error) {
      console.error('Failed to add complaint:', error)
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Complaints</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          File Complaint
        </Button>
      </Box>

      <Paper sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={complaints}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          disableSelectionOnClick
          loading={loading}
        />
      </Paper>

      <AddComplaintDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSubmit={handleAddComplaint}
      />
    </Box>
  )
}

export default Complaints