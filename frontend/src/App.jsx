import AppRouter from './app/routes/AppRouter.jsx'
import { ConfirmationProvider } from './context/ConfirmationContext.jsx'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import muiTheme from './theme/muiTheme.js'

function App() {
  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <ConfirmationProvider>
        <AppRouter />
      </ConfirmationProvider>
    </ThemeProvider>
  )
}

export default App
