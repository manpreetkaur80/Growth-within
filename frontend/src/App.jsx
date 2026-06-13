
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar     from './components/Navbar';
import Footer     from './components/Footer';
import Homepage   from './pages/Homepage';
import Dashboard  from './pages/Dashboard';
import Planner    from './pages/Planner';
import Journal    from './pages/Journal';
import Goals      from './pages/Goals';
import Visionpage from './pages/Visionpage';
import Habits     from './pages/Habits';
import Todolist   from './pages/Todolist';
import Login      from './pages/Login';
import Register        from './pages/Register';
import ForgotPassword  from './pages/ForgotPassword';
import ResetPassword   from './pages/ResetPassword';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/"         element={<Homepage />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register"              element={<Register />} />
        <Route path="/forgot-password"        element={<ForgotPassword />} />
        <Route path="/reset-password/:token"  element={<ResetPassword />} />

        {/* Protected — with navbar + footer */}
        <Route path="/*" element={
          <ProtectedRoute>
            <Navbar />
            <Routes>
              <Route path="/dashboard"     element={<Dashboard />} />
              <Route path="/planner"       element={<Planner />} />
              <Route path="/journal/:date" element={<Journal />} />
              <Route path="/goals"         element={<Goals />} />
              <Route path="/Visionpage"    element={<Visionpage />} />
              <Route path="/habits"        element={<Habits />} />
              <Route path="/todolist"      element={<Todolist />} />
            </Routes>
            <Footer />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;