import React, { useState, useEffect } from 'react';
import styled from "styled-components";
import Spinner from '../spinner/spinner';
import { getImageById, fetchUserData, fetchAcceptedProposalData, fetchGradingsData, gradeProposal, updateProposalStatusGraded, addComment, updateProposalStatusArchive, API_URL } from '../../services/apiService';
import Avatar from '../../images/User-512.webp';
import { Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import '../CSS/style.css';

export const logOut = () => {
  localStorage.removeItem('accessToken');
  window.location.href = "../login";
};

const EmployeeScoreSlider = ({ value, onValueChange }) => {
  const handleChange = (event) => {
    onValueChange(event.target.value);
  };

  return (
    <EmployeeScoreContainer>
      <EmployeeScoreInput
        type="range"
        min="1"
        max="10"
        value={value}
        onChange={handleChange}
        valueLabelDisplay="auto"
      />
      <EmployeeScoreValue style={{ left: `calc(${(value - 1) * 10}% + 24px)` }}>
        {value}
      </EmployeeScoreValue>
    </EmployeeScoreContainer>
  );
};



function Grading(props) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

     
  const [proposalData, setProposalData] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [proposersData, setProposersData] = useState(null);
  const [gradingsData, setGradingsData] = useState(null);
  const [benefitScores, setBenefitScores] = useState({});
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [isHovered, setIsHovered] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [proposerImage, setProposerImage] = useState(null);
  const [userRole, setUserRole] = useState(null);

    useEffect(() => {
      const storedUserRole = localStorage.getItem('userRole');
      if (storedUserRole) {
        setUserRole(storedUserRole);
      }
    }, []);
    
  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };
  const fetchData = async () => {
    try {
      const userDataResponse = await fetchUserData();
      const proposalDataResponse = await fetchAcceptedProposalData();
      const reversedProposalData = proposalDataResponse.reverse();
      const gradingsDataResponse = await fetchGradingsData();
      
   
      if (userDataResponse) {
        if(userDataResponse.avatar){
          const imageResponse = await getImageById(userDataResponse.avatar);
          setImageSrc(imageResponse.image);
        }
        setUserData(userDataResponse);
      }
      
      setProposalData(reversedProposalData);

      setGradingsData(gradingsDataResponse);
   

      if (reversedProposalData.length > 0) {
        console.log(reversedProposalData[0]);
        fetchProposersData(reversedProposalData[0].proposer);
        fetchCommentsData(reversedProposalData[0].id);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      window.location.href = "../login";
    }
  };

  const handleAddComment = async () => {
    try {
      await addComment(proposalData[currentIndex].id, commentText);
      await fetchCommentsData(proposalData[currentIndex].id);
      setCommentText('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleAddComment();
    }
  };

  useEffect(() => {
    fetchData();


  }, []);

  useEffect(() => {
    if (proposalData) {
      fetchProposersData();
      fetchCommentsData();
    }
  }, [proposalData]);

  const fetchProposersData = async (id) => {
    try {
      if (id) {
        const proposerDataResponse = await fetch(`${API_URL}/proposers/${id}/`);
        
        const proposerData = await proposerDataResponse.json();
        if(proposerData.user.avatar) {
          const imageUrl = await getImageById(proposerData.user.avatar);
          setProposerImage(imageUrl);
        }
        setProposersData(proposerData);
      }
    } catch (error) {
      console.error('Error fetching proposer data:', error);
    }
  };

  const fetchCommentsData = async (id) => {
    try {
      if (id) {
        const response = await fetch(`${API_URL}/proposals/${id}/get_comments/`);
        const data = await response.json();
        setComments(data.comments);
      }
    } catch (error) {
      console.error('Error fetching comments data:', error);
    }
  };

  let employeeData = [];

  if (proposersData && proposersData.user && gradingsData) {
    employeeData = [{
      name: `${proposersData.user.first_name} ${proposersData.user.last_name}`, 
      benefits: gradingsData.map((data, index) => ({ id: data.id, name: data.name }))
    }];
  } else {
    console.error("proposersData is invalid");
  }

  const handleBenefitScoreChange = (grading, newValue) => { 
    setBenefitScores(prevState => ({
      ...prevState,
      [grading]: newValue
    }));
  };

  const updateProposalList = async () => {
    try {
      const updatedProposalData = await fetchAcceptedProposalData();
      setProposalData(updatedProposalData);
      setBenefitScores({});
    } catch (error) {
      console.error('Error updating proposal list:', error);
    }
  };

  const archive = async (id) => {
    await updateProposalStatusArchive(proposalData[currentIndex].id, "Archived");
    updateProposalList();
  }
  
  const acceptGrade = async () => {
    try {
      if (!benefitScores || Object.keys(benefitScores).length < gradingsData.length) {

        toast.error("Change all grades.");
        return;
      }
  
      if (!proposalData || proposalData.length === 0) {
        console.error("No proposal data available.");
        return;
      }
  
      for (const [grading, score] of Object.entries(benefitScores)) {
        console.log("Sending request for grading:", grading, "with score:", score +  " id: " + proposalData[currentIndex].id);
        await gradeProposal(proposalData[currentIndex].id, grading, score);
      }
  
      await updateProposalStatusGraded(proposalData[currentIndex].id, "Graded");
  
      console.log("All gradings accepted successfully!");
      toast.success("All gradings accepted successfully!");
      await updateProposalList();
    } catch (error) {
      console.error("Error while accepting gradings:", error);
    }
    
  };

  const handleNext = () => {
    const nextProposal = proposalData.find((data, index) => index > currentIndex && data.status === "Accepted");
    if (nextProposal) {
      console.log(nextProposal.proposer);
      setBenefitScores({});
      setCurrentIndex(proposalData.indexOf(nextProposal));
      fetchProposersData(nextProposal.proposer);
      fetchCommentsData(nextProposal.id);
    }
  };

  const handleBack = () => {
    const prevProposal = proposalData.slice(0, currentIndex).reverse().find(data => data.status === "Accepted");
    if (prevProposal) {
      setBenefitScores({});
      setCurrentIndex(proposalData.indexOf(prevProposal));
      fetchProposersData(prevProposal.proposer);
      fetchCommentsData(prevProposal.id);
    }
  };

  

  if (loading) {
    return <Spinner />;
  }

  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Intl.DateTimeFormat('en-EN', options).format(new Date(dateString));
  };
  return (
    <>
    <Div>
      <Div2>
      <Div3>
        <Link to={"/main"}>
          <LogoKaizen src="https://cdn.builder.io/api/v1/image/assets/TEMP/3905e52e9c6b961ec6717c80409232f3222eab9fc52b8caf2e55d314ff83b93e?apiKey=76bc4e76ba824cf091e9566ff1ae9339&" alt="KaizenCloud Logo" />
          </Link>
          <NavBar>
          <Link to="/slider" style={{ textDecoration: 'none', marginTop: 57, cursor: 'pointer'}}>
            <Container className='not-selected'>
            <Button
              loading="lazy"
            > <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#7D7D7D"><path d="M200-120q-33 0-56.5-23.5T120-200v-400q0-33 23.5-56.5T200-680h160v80H200v400h560v-400H600v-80h160q33 0 56.5 23.5T840-600v400q0 33-23.5 56.5T760-120H200Zm280-200L320-480l56-56 64 63v-487h80v487l64-63 56 56-160 160Z"/></svg>
            </Button>
            <HoverText>Slider</HoverText>
            </Container>
          </Link>
         
          <Link to="/grading" style={{ textDecoration: 'none' }}>
            <Container className='selected'>
            <Button className='selected'
              loading="lazy"
            ><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#363636"><path d="m354-287 126-76 126 77-33-144 111-96-146-13-58-136-58 135-146 13 111 97-33 143ZM233-120l65-281L80-590l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Zm247-350Z"/></svg>
            </Button>
            <HoverText>Grading</HoverText>
            </Container>
          </Link>

          <Link to="/after_grading" style={{ textDecoration: 'none' }}>
            <Container className='not-selected'>
            <Button
              loading="lazy"
            ><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#7D7D7D"><path d="M160-120q-33 0-56.5-23.5T80-200v-560q0-33 23.5-56.5T160-840h640q33 0 56.5 23.5T880-760v560q0 33-23.5 56.5T800-120H160Zm0-80h640v-560H160v560Zm40-80h200v-80H200v80Zm382-80 198-198-57-57-141 142-57-57-56 57 113 113Zm-382-80h200v-80H200v80Zm0-160h200v-80H200v80Zm-40 400v-560 560Z"/></svg>
            </Button>
            <HoverText>After Grading</HoverText>
            </Container>
          </Link>

          <Link to="/assigned" style={{ textDecoration: 'none' }}>
            <Container className='not-selected'>
            <Button
              loading="lazy"
            ><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#7D7D7D"><path d="m424-318 282-282-56-56-226 226-114-114-56 56 170 170ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h168q13-36 43.5-58t68.5-22q38 0 68.5 22t43.5 58h168q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm280-590q13 0 21.5-8.5T510-820q0-13-8.5-21.5T480-850q-13 0-21.5 8.5T450-820q0 13 8.5 21.5T480-790ZM200-200v-560 560Z"/></svg>
            </Button>
            <HoverText>Assigned</HoverText>
            </Container>
          </Link>
          
          <Link to="/proposers" style={{ textDecoration: 'none' }}>
            <Container className='not-selected'>
            <Button
              loading="lazy"
            ><svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.1665 9.50004C12.5832 9.50004 12.0901 9.29865 11.6873 8.89587C11.2846 8.4931 11.0832 8.00004 11.0832 7.41671C11.0832 6.83337 11.2846 6.34032 11.6873 5.93754C12.0901 5.53476 12.5832 5.33337 13.1665 5.33337C13.7498 5.33337 14.2429 5.53476 14.6457 5.93754C15.0484 6.34032 15.2498 6.83337 15.2498 7.41671C15.2498 8.00004 15.0484 8.4931 14.6457 8.89587C14.2429 9.29865 13.7498 9.50004 13.1665 9.50004ZM8.99984 13.6667V12.5C8.99984 12.1667 9.08664 11.8577 9.26025 11.573C9.43386 11.2882 9.68039 11.0834 9.99984 10.9584C10.4998 10.75 11.0172 10.5938 11.5519 10.4896C12.0866 10.3855 12.6248 10.3334 13.1665 10.3334C13.7082 10.3334 14.2464 10.3855 14.7811 10.4896C15.3158 10.5938 15.8332 10.75 16.3332 10.9584C16.6526 11.0834 16.8991 11.2882 17.0728 11.573C17.2464 11.8577 17.3332 12.1667 17.3332 12.5V13.6667H8.99984ZM7.33317 7.00004C6.4165 7.00004 5.63178 6.67365 4.979 6.02087C4.32623 5.3681 3.99984 4.58337 3.99984 3.66671C3.99984 2.75004 4.32623 1.96532 4.979 1.31254C5.63178 0.659763 6.4165 0.333374 7.33317 0.333374C8.24984 0.333374 9.03456 0.659763 9.68734 1.31254C10.3401 1.96532 10.6665 2.75004 10.6665 3.66671C10.6665 4.58337 10.3401 5.3681 9.68734 6.02087C9.03456 6.67365 8.24984 7.00004 7.33317 7.00004ZM0.666504 13.6667V11.3334C0.666504 10.8612 0.784559 10.4271 1.02067 10.0313C1.25678 9.63546 1.58317 9.33337 1.99984 9.12504C2.83317 8.70837 3.69775 8.38893 4.59359 8.16671C5.48942 7.94448 6.40261 7.83337 7.33317 7.83337C7.81928 7.83337 8.30539 7.87504 8.7915 7.95837C9.27761 8.04171 9.76373 8.13893 10.2498 8.25004L9.5415 8.95837L8.83317 9.66671C8.58317 9.59726 8.33317 9.55212 8.08317 9.53129C7.83317 9.51046 7.58317 9.50004 7.33317 9.50004C6.52761 9.50004 5.73942 9.59726 4.96859 9.79171C4.19775 9.98615 3.45817 10.2639 2.74984 10.625C2.61095 10.6945 2.50678 10.7917 2.43734 10.9167C2.36789 11.0417 2.33317 11.1806 2.33317 11.3334V12H7.33317V13.6667H0.666504ZM7.33317 5.33337C7.7915 5.33337 8.18386 5.17018 8.51025 4.84379C8.83664 4.5174 8.99984 4.12504 8.99984 3.66671C8.99984 3.20837 8.83664 2.81601 8.51025 2.48962C8.18386 2.16324 7.7915 2.00004 7.33317 2.00004C6.87484 2.00004 6.48248 2.16324 6.15609 2.48962C5.8297 2.81601 5.6665 3.20837 5.6665 3.66671C5.6665 4.12504 5.8297 4.5174 6.15609 4.84379C6.48248 5.17018 6.87484 5.33337 7.33317 5.33337Z" fill="#7D7D7D" />
              </svg>
            </Button>
            <HoverText>Proposers</HoverText>
            </Container>
          </Link>

          <Link to="/proposals" style={{ textDecoration: 'none' }}>
            <Container className='not-selected'>
            <Button
              loading="lazy"
            ><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#7D7D7D"><path d="M320-280q17 0 28.5-11.5T360-320q0-17-11.5-28.5T320-360q-17 0-28.5 11.5T280-320q0 17 11.5 28.5T320-280Zm0-160q17 0 28.5-11.5T360-480q0-17-11.5-28.5T320-520q-17 0-28.5 11.5T280-480q0 17 11.5 28.5T320-440Zm0-160q17 0 28.5-11.5T360-640q0-17-11.5-28.5T320-680q-17 0-28.5 11.5T280-640q0 17 11.5 28.5T320-600Zm120 320h240v-80H440v80Zm0-160h240v-80H440v80Zm0-160h240v-80H440v80ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0-560v560-560Z"/></svg>
            </Button>
            <HoverText>Proposals</HoverText>
            </Container>
          </Link>
          
          <Link to="/settings/profile" style={{ textDecoration: 'none' }}>
            <Container className='not-selected'>
            <Button 
              loading="lazy"
            ><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z" fill="#7D7D7D"/></svg>
            </Button>
            <HoverText>Settings</HoverText>
            </Container>
          </Link>
          </NavBar>
        </Div3>
        <Div4>
          <Div5>
            <Div6>Company name</Div6>
            <DropdownWrapper onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}>
            <Div7>
              <Div8>
                <Img8
                  loading="lazy"
                  srcSet={imageSrc || Avatar}
                  alt="Person Image"
                  width="24"
                  height="24"
                />
                <Div9>{userData.first_name}</Div9>
              </Div8>
            </Div7>
            {isHovered && (    
                <DropdownMenu>
                {userRole === 'proposer' && 
                <Link to={`/profile/${userData.proposer.id}`} style={{textDecoration: 'none', color: '#333'}}> 
                  <DropdownItem>
                  <Div8>
                  <Div9>Profile</Div9>
              </Div8>
              <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#C4C4C4"><path d="M480-480q-60 0-102-42t-42-102q0-60 42-102t102-42q60 0 102 42t42 102q0 60-42 102t-102 42ZM192-192v-96q0-23 12.5-43.5T239-366q55-32 116.29-49 61.29-17 124.5-17t124.71 17Q666-398 721-366q22 13 34.5 34t12.5 44v96H192Zm72-72h432v-24q0-5.18-3.03-9.41-3.02-4.24-7.97-6.59-46-28-98-42t-107-14q-55 0-107 14t-98 42q-5 4-8 7.72-3 3.73-3 8.28v24Zm216.21-288Q510-552 531-573.21t21-51Q552-654 530.79-675t-51-21Q450-696 429-674.79t-21 51Q408-594 429.21-573t51 21Zm-.21-72Zm0 360Z"/></svg>
                  </DropdownItem>
                  </Link>
                  }
                  <Link to={'/main'} style={{textDecoration: 'none', color: '#333'}}> 
                  <DropdownItem>
                  <Div8>
                  <Div9>Home</Div9>
              </Div8>
              <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#C4C4C4"><path d="M264-216h96v-240h240v240h96v-348L480-726 264-564v348Zm-72 72v-456l288-216 288 216v456H528v-240h-96v240H192Zm288-327Z"/></svg>
                  </DropdownItem>
                  </Link>
                  <Link to={'/settings/profile'} style={{textDecoration: 'none', color: '#333'}}> 
                  <DropdownItem>
                  <Div8>
                  <Div9>Settings</Div9>
              </Div8>
              <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#C4C4C4"><path d="m403-96-22-114q-23-9-44.5-21T296-259l-110 37-77-133 87-76q-2-12-3-24t-1-25q0-13 1-25t3-24l-87-76 77-133 110 37q19-16 40.5-28t44.5-21l22-114h154l22 114q23 9 44.5 21t40.5 28l110-37 77 133-87 76q2 12 3 24t1 25q0 13-1 25t-3 24l87 76-77 133-110-37q-19 16-40.5 28T579-210L557-96H403Zm59-72h36l19-99q38-7 71-26t57-48l96 32 18-30-76-67q6-17 9.5-35.5T696-480q0-20-3.5-38.5T683-554l76-67-18-30-96 32q-24-29-57-48t-71-26l-19-99h-36l-19 99q-38 7-71 26t-57 48l-96-32-18 30 76 67q-6 17-9.5 35.5T264-480q0 20 3.5 38.5T277-406l-76 67 18 30 96-32q24 29 57 48t71 26l19 99Zm18-168q60 0 102-42t42-102q0-60-42-102t-102-42q-60 0-102 42t-42 102q0 60 42 102t102 42Zm0-144Z"/></svg>
                  </DropdownItem>
                  </Link>
                  <DropdownItem onClick={logOut}>
                  <Div8>
                <Div9>Logout</Div9>
              </Div8>
              <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#C4C4C4"><path d="M216-144q-29.7 0-50.85-21.15Q144-186.3 144-216v-528q0-29.7 21.15-50.85Q186.3-816 216-816h264v72H216v528h264v72H216Zm432-168-51-51 81-81H384v-72h294l-81-81 51-51 168 168-168 168Z"/></svg>
                  </DropdownItem>
                  </DropdownMenu>   
                      )}
            </DropdownWrapper> 
          </Div5>
          <Div10 className="slider-container">
            {(proposalData.length != 0) && (
              <Div11 className="slider">
                <Column></Column>
                <Column style={{position: 'fixed', width: '90%'}}>
                  {proposalData.filter(data => data.status === "Accepted").map((data, index) => (
                    <Div12
                      className={`slide ${index === currentIndex ? 'active' : ''} ${index < currentIndex ? 'slideToLeft' : index > currentIndex ? 'slideToRight' : ''}`}
                      key={data.id}
                    >
                      <Div13>
                        <Div14>{formatDate(data.created_at)}</Div14>
                        <Div15>
                          <ArchiveButton onClick={archive}>Archive</ArchiveButton>
                        </Div15>
                        <Div19>
                          {currentIndex > 0 && <BackButton onClick={handleBack}>Back</BackButton>}
                          {currentIndex < proposalData.length - 1 && <NextButton onClick={handleNext}>Next</NextButton>}
                        </Div19>
                      </Div13>
                      <Div22 />
                      <Div23>
                        <Div24>
                          <Div25>{data.title}</Div25>
                          <Div26>{data.text}</Div26>
                        </Div24>
                        <Div27 />
                        <Div28>
                          <Div29>
                            <Div30>Comments</Div30>
                            <Div31>    {comments.length > 0 && (
    <div key={comments[comments.length - 1].id}>{comments[comments.length - 1].text}</div>
  )}</Div31>
                          </Div29>
                          <Comments  type="text" 
        placeholder="Your comments" 
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        onKeyPress={handleKeyPress}/>
                        </Div28>
                      </Div23>
                    </Div12>
                  ))}
                </Column>
                <Column2>
                  <>
                  <ContainerTwo>
  <EmployeeSection>
  {employeeData.map((employee, index) => (
  <EmployeeInfo key={index}>
    <EmployeeDetails>
      <EmployeeAvatar src={proposerImage || Avatar} alt="Employee Avatar" />
      <EmployeeText>
        <EmployeeName>{employee.name}</EmployeeName>
        <EmployeeId>{employee.score}</EmployeeId>
      </EmployeeText>
    </EmployeeDetails>
    <BenefitDetails>
    {employee.benefits.map((benefit, index) => (
      <div key={index}>
        <EmployeeBenefit>{benefit.name}</EmployeeBenefit>
        <EmployeeScoreSlider
          value={benefitScores[benefit.id] || 1} 
          onValueChange={(value) => handleBenefitScoreChange(benefit.id, value)} 
        />
      </div>
    ))}
    </BenefitDetails>
  </EmployeeInfo>
))}
  </EmployeeSection>
  <AcceptButton onClick={acceptGrade}>Accept</AcceptButton>
</ContainerTwo>
                  </>
                </Column2>
              </Div11>
            )}

          </Div10>

        </Div4>
      </Div2>
      <Toaster />
    </Div>
    </>
  );
}

const LogoKaizen = styled.img`
  aspect-ratio: 1.12;
  object-fit: contain;
  object-position: center;
  width: 43px;
`;

const BenefitDetails = styled.div`
  height: 400px;
  overflow: auto;
`;

const Div = styled.div`
  background-color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;
const Div2 = styled.div`
  background-color: #f2f2f2;
  height: 100vh;
  display: flex;
  padding-right: 10px;
  justify-content: space-between;
  gap: 11px;
  @media (max-width: 991px) {
    max-width: 100%;
    flex-wrap: wrap;
  }
`;
const Div3 = styled.div`
  position: fixed;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-basis: 0%;
  flex-direction: column;
  padding: 15px 0;
  @media (max-width: 991px) {
    display: none;
  }
`;
const NavBar = styled.div`
  flex-grow: 1;
  cursor: pointer;
  background-color: #f2f2f2;
  display: flex;
  gap: 15px;
  flex-basis: 0%;
  flex-direction: column;
  width: 50px;
  padding-top: 57px;
  transition: width 0.3s ease;
  position: relative;
  @media (max-width: 991px) {
    display: none;
  }
  &:hover {
    width: 170px;
  }
`;
const Container = styled.div`
  display: flex;
  padding: 0 5px;
  align-items: center;
  transition: background-color 0.3s ease;
  ${NavBar}:hover &.selected {
    background-color: #ADD8E6;
  }

  &.not-selected:hover {
    background-color: #FFFFFF;
  }

`;

const Button = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  aspect-ratio: 1;
  width: 40px;
  border-radius: 50%;
  transition: border-radius 0.3s ease;
  ${NavBar}:hover & {
    border-radius: 0%;
  }
  &.selected {
    background-color: #ADD8E6;
  }
  @media (max-width: 991px) {
  }
  
`;

const HoverText = styled.div`
  position: relative;
  height: 100%;
  font-size: 15px;
  left: 15px;
  color: #333;
  padding-bottom: 3px;
  white-space: nowrap; 
  overflow: hidden;
  display: block;
  font-weight: 500;
  width: 0px;
  transition: width 0.3s ease;
  &.selected{
    font-weight: 600;
  }
  ${NavBar}:hover & {
    width: 95px;
    display: block;
  }
`;
const Div4 = styled.div`
  margin-left: 60px;
  align-self: start;
  display: flex;
  margin-top: 5px;
  flex-grow: 1;
  flex-basis: 0%;
  flex-direction: column;
  @media (max-width: 991px) {
    max-width: 100%;
  }
`;
const Div5 = styled.div`
  display: flex;
  width: 100%;
  align-items: start;
  justify-content: space-between;
  gap: 20px;
  font-size: 16px;
  color: #5d5d5d;
  font-weight: 400;
  white-space: nowrap;
  @media (max-width: 991px) {
    max-width: 100%;
    flex-wrap: wrap;
    white-space: initial;
  }
`;
const Div6 = styled.div`
  font-family: Roboto, sans-serif;
  border-radius: 8px;
  border: 1px solid #d7d7d7;
  background-color: #fff;
  justify-content: center;
  padding: 13px 49px;
  @media (max-width: 991px) {
    white-space: initial;
    padding: 0 20px;
  }
`;
const DropdownWrapper = styled.div`
  width: 160px;
  z-index: 5;
`;
const Div7 = styled.div`
  border-radius: 8px;
  border: 1px solid #d7d7d7;
  background-color: #fff;
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding: 8px 13px;
  @media (max-width: 991px) {
    white-space: initial;
  }
`;
const Div8 = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
  @media (max-width: 991px) {
    white-space: initial;
  }
`;
const Img8 = styled.img`
  border-radius: 50%;
  aspect-ratio: 1;
  object-fit: auto;
  object-position: center;
  width: 24px;
`;
const Div9 = styled.div`
  font-family: Roboto, sans-serif;
  flex-grow: 1;
  margin: auto 0;
  @media (max-width: 991px) {
    white-space: initial;
  }
`;
const DropdownMenu = styled.div`
  width: 160px;
  position: absolute;
  top: 45px;
  display: flex;
  flex-direction: column;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const DropdownItem = styled.div`
  border: 1px solid #d7d7d7;
  display: flex;
  justify-content: space-between;
  gap: 20px;
  @media (max-width: 991px) {
    white-space: initial;
  }
  padding: 8px 12px;
  color: #333;
  cursor: pointer;

  &:hover {
    background-color: #f0f0f0;
  }
`;
const Img9 = styled.button`
aspect-ratio: 1.15;
object-fit: auto;
object-position: center;
width: 15px;

cursor:pointer;
background: transparent;
border: none !important;
font-size:0;
margin: auto 0;
`;
const Div10 = styled.div`
  margin-top: 55px;
  @media (max-width: 991px) {
    max-width: 100%;
    margin-top: 40px;
  }
`;
const Div11 = styled.div`
  display: flex;
  @media (max-width: 991px) {
    flex-direction: column;
    align-items: stretch;
    gap: 0px;
  }
`;
const Column = styled.div`
  display: flex;
  flex-direction: column;
  line-height: normal;
  width: 70%;
  margin-left: 0px;
  @media (max-width: 991px) {
    width: 100%;
  }
`;
const Div12 = styled.div`
  border-radius: 8px;
  box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.2);
  background-color: #fff;
  display: flex;
  flex-direction: column;
  font-size: 14px;
  padding: 3px 0 22px;
  @media (max-width: 991px) {
    max-width: 100%;
    margin-top: 15px;
  }
`;
const Div13 = styled.div`
  display: flex;
  width: 100%;
  padding-right: 32px;
  justify-content: space-between;
  gap: 20px;
  color: #5d5d5d;
  font-weight: 400;
  @media (max-width: 991px) {
    max-width: 100%;
    flex-wrap: wrap;
    padding-right: 20px;
  }
`;
const Div14 = styled.div`
  font-family: Roboto, sans-serif;
  margin: auto 20px;
`;
const Div15 = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 4px;
  white-space: nowrap;
  @media (max-width: 991px) {
    white-space: initial;
  }
`;
const ArchiveButton = styled.button`
&:hover {
  transform: translateY(-5px);
  color: #333;
  cursor:pointer;
  box-shadow: .0rem .2rem .4rem #777;
  /* line I added */
  background-color:#ECF3FF;
  pointer-events: visible;
  position: relative;
  z-index: 0;
  visibility: visible;
  float: none;
}
  border:none;
  cursor:pointer;
  font-family: Roboto, sans-serif;
  border-radius: 8px 4px 4px 8px;
  background-color: #e6e6e6;
  flex-grow: 1;
  justify-content: center;
  padding: 13px 27px;
  
  @media (max-width: 991px) {
    white-space: initial;
    padding: 0 20px;
  }
`;
const Div19 = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 4px;
  white-space: nowrap;
  @media (max-width: 991px) {
    white-space: initial;
  }
`;
const BackButton = styled.button`
cursor:pointer;
&:hover {
  transform: translateY(-5px);
  color: #333;
  cursor:pointer;
  box-shadow: .0rem .2rem .4rem #777;
  /* line I added */
  background-color:#ECF3FF;
  pointer-events: visible;
  position: relative;
  z-index: 0;
  visibility: visible;
  float: none;
}
border:none;
  font-family: Roboto, sans-serif;
  border-radius: 8px 4px 4px 8px;
  background-color: #e6e6e6;
  flex-grow: 1;
  justify-content: center;
  padding: 13px 21px;
  @media (max-width: 991px) {
    white-space: initial;
    padding: 0 20px;
  }
`;
const NextButton = styled.button`
&:hover {
  transform: translateY(-5px);
  color: #333;
  cursor:pointer;
  box-shadow: .0rem .2rem .4rem #777;
  /* line I added */
  background-color:#ECF3FF;
  pointer-events: visible;
  position: relative;
  z-index: 0;
  visibility: visible;
  float: none;
}
  cursor:pointer;
  border:none;
  font-family: Roboto, sans-serif;
  border-radius: 4px 8px 8px 4px;
  background-color: #e6e6e6;
  flex-grow: 1;
  justify-content: center;
  padding: 13px 38px 13px 17px;
  @media (max-width: 991px) {
    padding-right: 20px;
    white-space: initial;
  }
`;
const Div22 = styled.div`
  background-color: #e6e6e6;
  margin-top: 10px;
  height: 1px;
  @media (max-width: 991px) {
    max-width: 100%;
  }
`;
const Div23 = styled.div`
  margin-left:20px;
  display: flex;
  margin-top: 18px;
  z-index:0;
  align-items: start;
  justify-content: space-between;
  gap: 35px;
  @media (max-width: 991px) {
    max-width: 100%;
    flex-wrap: wrap;
  }
`;
const Div24 = styled.div`
  display: flex;
  flex-grow: 1;
  flex-basis: 0%;
  flex-direction: column;
  @media (max-width: 991px) {
    max-width: 100%;
  }
`;
const Div25 = styled.div`
  color: #3fc86e;
  font-family: Roboto, sans-serif;
  font-weight: 600;
  @media (max-width: 991px) {
    max-width: 100%;
  }
`;
const Div26 = styled.div`
  color: #5d5d5d;
  font-family: Roboto, sans-serif;
  font-weight: 400;
  margin-top: 17px;
  @media (max-width: 991px) {
    max-width: 100%;
  }
`;
const Div27 = styled.div`
  background-color: #e6e6e6;
  align-self: stretch;
  width: 1px;
  height: 174px;
`;
const Div28 = styled.div`
  display: flex;
  flex-grow: 1;
  flex-basis: 0%;
  flex-direction: column;
  color: #5d5d5d;
  @media (max-width: 991px) {
    max-width: 100%;
  }
`;
const Div29 = styled.div`
  align-self: start;
  display: flex;
  margin-left: 10px;
  flex-direction: column;
  white-space: nowrap;
  @media (max-width: 991px) {
    white-space: initial;
  }
`;
const Div30 = styled.div`
  font-family: Roboto, sans-serif;
  font-weight: 600;
`;
const Div31 = styled.div`
  font-family: Roboto, sans-serif;
  font-weight: 400;
  margin-top: 26px;
  @media (max-width: 991px) {
    white-space: initial;
  }
`;
const Comments = styled.input`
  border:none;
  font-family: Roboto, sans-serif;
  border-radius: 8px;
  background-color: #f2f2f2;
  margin-top: 24px;
  font-weight: 300;
  width:75%;
  padding: 14px 60px 70px 10px;
  @media (max-width: 991px) {
    max-width: 100%;
    padding-right: 20px;
  }
`;
const Column2 = styled.div`
  display: flex;
  flex-direction: column;
  line-height: normal;
  width: 30%;
  margin-left: 20px;
  @media (max-width: 991px) {
    width: 100%;
  }
`;


const ContainerTwo = styled.div`
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  font-weight: 400;

  @media (max-width: 991px) {
    max-width: 100%;
    margin-top: 40px;
  }
`;

const EmployeeSection = styled.section`
  background-color: #fff;
  border-radius: 8px;
  padding: 15px;
  gap: 20px;
  justify-content: space-between;

  @media (max-width: 991px) {
    max-width: 100%;
    flex-wrap: wrap;
    padding-right: 20px;
  }
`;

const EmployeeInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const EmployeeDetails = styled.div`
  display: flex;
  gap: 15px;
`;

const EmployeeAvatar = styled.img`
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 50%;
`;

const EmployeeText = styled.div`
  align-self: start;
  display: flex;
  margin-top: 4px;
  flex-direction: column;
`;

const EmployeeName = styled.h3`
  color: #5d5d5d;
  font: 16px Roboto, sans-serif;
  margin: 0;
`;

const EmployeeId = styled.p`
  color: #8d8d8d;
  margin: 12px 0 0;
  font: 12px Roboto, sans-serif;
`;

const EmployeeBenefit = styled.p`
  color: #5b5b5b;
  margin-top: 26px;
  margin-bottom: 10px;
  font: 16px Roboto, sans-serif;

  &:last-child {
    margin-top: 52px;

    @media (max-width: 991px) {
      margin-top: 40px;
    }
  }
`;

const EmployeeScoreContainer = styled.div`
  position: relative;
  width: 100%;
`;

const EmployeeScoreInput = styled.input`
  -webkit-appearance: none;
  width: calc(100% - 24px); /* Рассчитываем ширину инпута так, чтобы учесть размеры кружка и текста */
  height: 15px;
  border-radius: 5px;
  background: #d3d3d3;
  outline: none;
  opacity: 0.7;
  -webkit-transition: 0.2s;
  transition: opacity 0.2s;
  margin: 0 12px; /* Устанавливаем отступы слева и справа для кружка и текста */

  &:hover {
    opacity: 1;
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 25px;
    height: 25px;
    border-radius: 50%;
    background: #B3D2E6;
    cursor: pointer;
    position: relative;
    z-index: 2;
  }

  &::-moz-range-thumb {
    width: 25px;
    height: 25px;
    border-radius: 50%;
    background: #B3D2E6;
    cursor: pointer;
    position: relative;
    z-index: 2;
  }
`;

const EmployeeScoreValue = styled.span`
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  color: #FFFFF9;
  font-size: 14px;
  pointer-events: none; /* Чтобы предотвратить взаимодействие с текстом */
  z-index: 3; /* Убедимся, что текст всегда находится поверх кружка */
`;


const AcceptButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 6px;
  background-color: #109cf1;
  margin-top: 25px;
  color: #fff;
  padding: 10px;
  font: 16px Roboto, sans-serif;
  border: none;
  cursor: pointer;

  @media (max-width: 991px) {
    max-width: 100%;
    padding: 0 20px;
  }
`;

export default Grading;