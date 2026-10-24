import type { RouteObject } from 'react-router'
import CatalogPage from './catalog/CatalogPage'
import Layout from './Layout'

export const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { index: true, element: <CatalogPage /> },
      { path: '*', element: <p>Page not found.</p> },
    ],
  },
]
