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
} from '@mui/material'
import { useAuth } from '../../contexts/AuthContext'
import { config } from '../../config/config'

const ODLog = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [odData, setOdData] = useState({
    startOD: '',
    endOD: '',
    startImage: null,
    endImage: null,
    date: new Date().toISOString().split('T')[0]
  })
  const [currentLog, setCurrentLog] = useState(null)

  useEffect(() => {
    fetchCurrentLog()
  }, [])

  const fetchCurrentLog = async () => {
    try {
      const response = await fetch(config.API_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'getODLog',
          date: new Date().toISOString().split('T')[0],
          driver: user.name
        })
      })
      const data = await response.json()
      if (data.success && data.data) {
        setCurrentLog(data.data)
        setOdData(prev => ({
          ...prev,
          startOD: data.data.startOD || '',
          endOD: data.data.endOD || ''
        }))
      }
    } catch (error) {
      console.error('Failed to fetch OD log:', error)
    }
  }

  const handleImageChange = (type) => (event) => {
    if (event.target.files?.[0]) {
      // Validate file size
      if (event.target.files[0].size > config.IMAGE_UPLOAD.MAX_SIZE) {
        setError('Image size should be less than 5MB')
        return
      }

      // Validate file type
      if (!config.IMAGE_UPLOAD.ALLOWED_TYPES.includes(event.target.files[0].type)) {
        setError('Only JPEG and PNG images are allowed')
        return
      }

      setOdData(prev => ({
        ...prev,
        [type]: event.target.files[0]
      }))
      setError('')
    }
  }

  const handleSubmit = async (type) => {
    if (type === 'start' && (!odData.startOD || !odData.startImage)) {
      setError('Please enter starting OD reading and upload image')
      return
    }

    if (type === 'end' && (!odData.endOD || !odData.endImage)) {
      setError('Please enter ending OD reading and upload image')
      return
    }

    // Validate OD readings
    const odValue = type === 'start' ? odData.startOD : odData.endOD
    if (odValue < config.VALIDATION.OD_READING.MIN || 
        odValue > config.VALIDATION.OD_READING.MAX) {
      setError('Invalid OD reading')
      return
    }

    if (type === 'end' && parseInt(odData.endOD) <= parseInt(odData.startOD)) {
      setError('Ending OD must be greater than starting OD')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const formData = new FormData()
      formData.append('action', 'updateODLog')
      formData.append('driver', user.name)
      formData.append('date', odData.date)
      formData.append(type === 'start' ? 'startOD' : 'endOD', 
        type === 'start' ? odData.startOD : odData.endOD)
      formData.append(type === 'start' ? 'startImage' : 'endImage', 
        type === 'start' ? odData.startImage : odData.endImage)

      const response = await fetch(config.API_URL, {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      if (data.success) {
        setSuccess(`${type === 'start' ? 'Starting' : 'Ending'} OD updated successfully`)
        fetchCurrentLog()
      } else {
        setError(data.error || 'Failed to update OD log')
      }
    } catch (error) {
      console.error('Failed to update OD log:', error)
      setError('Failed to update OD log. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Odometer Log
      </Typography>

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

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Starting OD
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Starting OD Reading"
                type="number"
                value={odData.startOD}
                onChange={(e) => setOdData(prev => ({ ...prev, startOD: e.target.value }))}
                disabled={currentLog?.startOD}
              />
              <Box>
                <input
                  accept="image/*"
                  type="file"
                  onChange={handleImageChange('startImage')}
                  style={{ display: 'none' }}
                  id="start-image-upload"
                  disabled={currentLog?.startOD}
                />
                <label htmlFor="start-image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    disabled={currentLog?.startOD}
                  >
                    Upload Starting OD Image
                  </Button>
                </label>
                {odData.startImage && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Selected: {odData.startImage.name}
                  </Typography>
                )}
              </Box>
              <Button
                variant="contained"
                onClick={() => handleSubmit('start')}
                disabled={loading || currentLog?.startOD}
              >
                {loading ? <CircularProgress size={24} /> : 'Submit Starting OD'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Ending OD
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Ending OD Reading"
                type="number"
                value={odData.endOD}
                onChange={(e) => setOdData(prev => ({ ...prev, endOD: e.target.value }))}
                disabled={!currentLog?.startOD || currentLog?.endOD}
              />
              <Box>
                <input
                  accept="image/*"
                  type="file"
                  onChange={handleImageChange('endImage')}
                  style={{ display: 'none' }}
                  id="end-image-upload"
                  disabled={!currentLog?.startOD || currentLog?.endOD}
                />
                <label htmlFor="end-image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    disabled={!currentLog?.startOD || currentLog?.endOD}
                  >
                    Upload Ending OD Image
                  </Button>
                </label>
                {odData.endImage && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Selected: {odData.endImage.name}
                  </Typography>
                )}
              </Box>
              <Button
                variant="contained"
                onClick={() => handleSubmit('end')}
                disabled={loading || !currentLog?.startOD || currentLog?.endOD}
              >
                {loading ? <CircularProgress size={24} /> : 'Submit Ending OD'}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default ODLog