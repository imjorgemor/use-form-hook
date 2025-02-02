import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RegisterForm } from './RegisterForm';
import {TestForm} from './TestForm'

createRoot(document.getElementById('root')!).render(
//   <StrictMode>
    <TestForm />
//   </StrictMode>,
)
