import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import SignInComponent from './components/signInComponents/SignInComponent';
import MainPage from './components/mainPage/mainPage';
import Slider from './components/sliderComponent/sliderComponent';
import Proposals from './components/proposalsComponent/proposalsComponent';
import AfterGrading from './components/afterGradingComponent/afterGradingComponent';
import Grading from './components/graidingComponent/grading';
import AddProposal from './components/addProposalComponent/addProposalComponent';
import Registration from './components/registrationPage/registrationComponent';
import ProposerMainPage from './components/proposerMainPageComponent/proposerMainPageComponent';
import Proposers from './components/proposersComponent/proposersComponent'
import Profile from './components/profile/profile';
import Assigned from './components/assignedMainComponent/assignedMainComponent';
import AssignedSpecialist from './components/assignedSpecialistComponent/assignedSpecialistComponent';
import SettingsProfileComponent from './components/settingsComponent/ProfileComponent';
import NotFoundPage from './components/notFoundComponent/notFoundComponent';
import './reset.css'

function App() {
  const [userRole, setUserRole] = useState(null);
  useEffect(() => {
    const storedUserRole = localStorage.getItem('userRole');
    if (storedUserRole) {
      setUserRole(storedUserRole);
    }
  }, []);

  const accessToken = localStorage.getItem('accessToken');
  
  return (
    <Router>
      <Routes>
      {!accessToken ? (
          <>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<SignInComponent/>} />
            <Route path="/registration" element={<Registration />} />
            <Route path="/slider" element={<Navigate to="/login" replace />} />
            <Route path="/assigned" element={<Navigate to="/login" replace />} />
            <Route path="/grading" element={<Navigate to="/login" replace />} />
            <Route path="/proposals" element={<Navigate to="/login" replace />} />
            <Route path="/after_grading" element={<Navigate to="/login" replace />} />
            <Route path="/add_proposal" element={<Navigate to="/login" replace />} />
            <Route path="/proposers" element={<Navigate to="/login" replace />} />
            <Route path="/main" element={<Navigate to="/login" replace />} />
            <Route path="/profile/:profileId" element={<Navigate to="/login" replace />} />
            <Route path="/settings/profile" element={<Navigate to="/login" replace />} />
          </>
        ) : (
          <>
            <Route path="/" element={<Navigate to="/main" replace />} />
            <Route path="/login" element={<Navigate to='/main' replace />} />
            <Route path="/registration" element={<Navigate to='/main' replace />} />
            <Route path="password_reset" element={<Navigate to='/main' replace />}></Route>
            <Route path="/proposals" element={<Proposals />} />
            <Route path="/grading" element={userRole === 'proposer' ? <Navigate to="/main" replace /> : <Grading />} />
            <Route path="/slider" element={userRole === 'proposer' ? <Navigate to="/main" replace /> : <Slider />} />
            <Route path="/add_proposal" element={userRole === 'proposer' ? <AddProposal /> : <Navigate to="/main" replace />} /> 
            <Route path="/after_grading" element={userRole === 'staff' ? <AfterGrading /> : <Navigate to="/main" replace />} /> 
            <Route path="/proposers" element={<Proposers />} />
            <Route path="/main" element={userRole === 'proposer' ? <ProposerMainPage /> : <MainPage />} />
            <Route path="/assigned" element={userRole === 'proposer' ? <AssignedSpecialist /> : <Assigned />} />
            <Route path="/profile/:profileId" element={<Profile />} />
            <Route path="/settings/profile" element={<SettingsProfileComponent />} />
          </>
        )}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;