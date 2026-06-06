
import './App.css'
import { Route, Routes } from 'react-router-dom'
import CreatePostPage from './pages/user/CreatePostPage'
import Register from './pages/user/Register'

function App() {
  // const [count, setCount] = useState(0)

  return (
    <>
     <Routes>
      <Route path="/register" element={<Register/>}/>
      <Route path="/posts/create" element={<CreatePostPage />} />
     </Routes>
    </>
  )
}

export default App
 