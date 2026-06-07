import "./App.css";
import { Route, Routes } from "react-router-dom";
import CreatePostPage from "./pages/user/CreatePostPage";
import Register from "./pages/user/Register";
import EditPostPage from "./pages/user/EditPostPage";

function App() {
  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/posts/create" element={<CreatePostPage />} />
      <Route path="/posts/:id/edit" element={<EditPostPage />} />
    </Routes>
  );
}

export default App;
