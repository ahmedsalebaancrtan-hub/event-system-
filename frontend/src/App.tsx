import { RouterProvider } from 'react-router-dom'
import { routes } from './routes'
import { ThemeProvider } from './components/common/ThemeProvider'

const App = () => {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <RouterProvider router={routes}/>
    </ThemeProvider>
  )
}

export default App