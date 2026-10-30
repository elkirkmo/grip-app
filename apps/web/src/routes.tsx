import type { RouteObject } from 'react-router'
import CartPage from './cart/CartPage'
import CatalogPage from './catalog/CatalogPage'
import Layout from './Layout'

export const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { index: true, element: <CatalogPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: '*', element: <p>Page not found.</p> },
    ],
  },
]
