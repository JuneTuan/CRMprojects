import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from '@pages/Login'
import Dashboard from '@pages/Dashboard'
import Customer from '@pages/Customer'
import Staff from '@pages/Staff'
import Product from '@pages/Product'
import Order from '@pages/Order'
import Prize from '@pages/Prize'
import Coupon from '@pages/Coupon'
import Activity from '@pages/Activity'
import Import from '@pages/Import'
import Cleanup from '@pages/Cleanup'
import Layout from '@components/Layout'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="customer" element={<Customer />} />
        <Route path="staff" element={<Staff />} />
        <Route path="activity" element={<Activity />} />
        <Route path="product" element={<Product />} />
        <Route path="order" element={<Order />} />
        <Route path="prize" element={<Prize />} />
        <Route path="coupon" element={<Coupon />} />
        <Route path="import" element={<Import />} />
        <Route path="cleanup" element={<Cleanup />} />
      </Route>
    </Routes>
  )
}

export default App
