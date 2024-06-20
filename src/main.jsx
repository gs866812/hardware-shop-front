import React from 'react'
import ReactDOM from 'react-dom/client'

import './index.css'
import { RouterProvider } from 'react-router-dom'
import { router } from './AppRoute'
import Provider from './Provider'
import DeviceRestriction from './Pages/DeviceRestriction'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider>
      <DeviceRestriction>
      <div className='poppins'>
        <RouterProvider router={router} />
      </div>
      </DeviceRestriction>
    </Provider>
  </React.StrictMode>,
)
