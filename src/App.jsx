import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'
import { ThemeProvider } from './hooks/useTheme.jsx'
import Navbar from './components/Navbar'
import Footer from './sections/Footer'
import Home from './pages/Home'
import Writing from './pages/Writing'
import Post from './pages/Post'
import About from './pages/About'
import Portfolio from './pages/Portfolio'
import Contact from './pages/Contact'

function Layout() {
  return (
    <div className="bg-bg-dark text-text-primary font-body min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/writing', element: <Writing /> },
      { path: '/writing/:slug', element: <Post /> },
      { path: '/about', element: <About /> },
      { path: '/portfolio', element: <Portfolio /> },
      { path: '/contact', element: <Contact /> },
    ],
  },
])

export default function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}
