import { RouterProvider } from 'react-router-dom'
import { routes } from './routes'
import { ThemeProvider } from './components/theme-provider'

const App = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <RouterProvider router={routes}/>
    </ThemeProvider>
  )
}

export default App