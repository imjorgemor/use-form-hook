import { createRoot } from 'react-dom/client'
import './index.css'
import { TestForm } from './FormWithValidation'

createRoot(document.getElementById('root')!).render(
    <TestForm />
)
