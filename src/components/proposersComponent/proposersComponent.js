import React, { useState, useEffect } from 'react';
import styled from "styled-components";
import Spinner from '../spinner/spinner';
import searchIconSvg from '../../images/search-icon.svg'
import datePolygonSvg from '../../images/date-polygon.svg'
import checkboxArrowSvg from '../../images/checkbox-arrow.svg'
import { fetchUserData, fetchProposalData, fetchProposersData, getImageById, fetchProposalsByID } from '../../services/apiService';
import Avatar from '../../images/User-512.webp';
import { Link } from 'react-router-dom';

export const logOut = () => {
  localStorage.removeItem('accessToken');
  window.location.href = "../login";
  localStorage.removeItem('userRole');
};

function ProposersComponent(props) {
  const [imageSrc, setImageSrc] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [proposalData, setProposalData] = useState(null);
  const [proposals, setProposals] = useState(null);
  const [proposersData, setProposersData] = useState(null);
  const [originalProposersData, setOriginalProposersData] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [currentProposer, setCurrentProposer] = useState(0);
  const [currentProposerImg, setCurrentProposerImg] = useState(null);
  const [proposerProposals, setProposerProposals] = useState(null);
  const [currentProposal, setCurrentProposal] = useState(0);

  const [query, setQuery] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);


  const handleNextProposal = () => {
    if (currentProposal < proposerProposals.length - 1) {
      setCurrentProposal(currentProposal + 1);
    }
  };

  const handlePreviousProposal = () => {
    if (currentProposal > 0) {
      setCurrentProposal(currentProposal - 1);
    }
  };


  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };
  

  const checkbox = (event) => {
    setIsChecked(event.target.checked);
  };

  const [error, setError] = useState(null);

  useEffect(() => {
    const storedUserRole = localStorage.getItem('userRole');
    if (storedUserRole) {
      setUserRole(storedUserRole);
    }
  }, []);

  let rowNum = 0;
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userDataResponse = await fetchUserData();
        const proposalData = await fetchProposalData();
        const proposersData = await fetchProposersData();
        setProposalData(proposalData);
        setProposals(proposalData);
        setUserData(userDataResponse);
        const proposalsDataByIdResponse = await fetchProposalsByID(proposersData[currentProposer].id);
        setProposerProposals(proposalsDataByIdResponse);
        if(userDataResponse.avatar){
          const imageResponse = await getImageById(userDataResponse.avatar);
          setImageSrc(imageResponse.image);
        }
        if(proposersData[currentProposer].user.avatar){
          const imageResponse = await getImageById(proposersData[currentProposer].user.avatar);
          setCurrentProposerImg(imageResponse.image);
        }
        setProposersData(proposersData);
        setOriginalProposersData(proposersData);
        setLoading(false);
      } catch (error) {
        setError(error.message);

        console.error('Error fetching user data:', error);
      }
    };

    fetchData();
  }, []);


  const handleTableRowClick = async (proposer_id) => {
    console.log(proposer_id);
    if(proposer_id != currentProposer){
      setCurrentProposer(proposer_id);
      const proposalsDataByIdResponse = await fetchProposalsByID(proposersData[proposer_id].id);
      if(proposalsDataByIdResponse) {
        setProposerProposals(proposalsDataByIdResponse);
      } else {
      setProposerProposals(null);
      }
      if(proposersData[proposer_id].user.avatar){
        const imageResponse = await getImageById(proposersData[proposer_id].user.avatar);
        setCurrentProposerImg(imageResponse.image);
      } else {
        setCurrentProposerImg(null);
      }
    }
  };
  
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedLanguage, setSelectedLanguage] = React.useState("ENG");
  const languages = ["ENG", "РУС", "ҚАЗ"];

  const handleLanguageClick = (language) => {
    setSelectedLanguage(language);
    setIsOpen(false);
  };

  const filteredLanguages = languages.filter(lang => lang !== selectedLanguage);
  
  const searchInputChange = (event) => {
    const { value } = event.target;
    setQuery(value);
    if (value === '') {
      setProposersData(originalProposersData);
    } else{
    
    const filteredProposers = originalProposersData.filter(proposer => {
      const fullName = `${proposer.user.first_name} ${proposer.user.last_name}`;
      return fullName.toLowerCase().includes(value.toLowerCase());
    });
    setProposersData(filteredProposers);
    }
  };

  if (loading) {
    return <Spinner />; 
  }
  return (
    <Div>
      <Div2>
      {userRole === 'staff' && <Div3>
        <Link to={"/main"}>
          <LogoKaizen src="https://cdn.builder.io/api/v1/image/assets/TEMP/3905e52e9c6b961ec6717c80409232f3222eab9fc52b8caf2e55d314ff83b93e?apiKey=76bc4e76ba824cf091e9566ff1ae9339&" alt="KaizenCloud Logo" />
          </Link>
          <NavBar>
          <Link to="/slider" style={{ textDecoration: 'none', marginTop: 57}}>
            <NavContainer className='not-selected'>
            <Button
              loading="lazy"
            ><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#7D7D7D"><path d="M200-120q-33 0-56.5-23.5T120-200v-400q0-33 23.5-56.5T200-680h160v80H200v400h560v-400H600v-80h160q33 0 56.5 23.5T840-600v400q0 33-23.5 56.5T760-120H200Zm280-200L320-480l56-56 64 63v-487h80v487l64-63 56 56-160 160Z"/></svg>
            </Button>
            <HoverText>Slider</HoverText>
            </NavContainer>
          </Link>
          <Link to="/grading" style={{ textDecoration: 'none' }}>
          <NavContainer className='not-selected'>
            <Button
              loading="lazy"
            ><svg width="19" height="17" viewBox="0 0 19 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.39333 13.0044L9.33333 11.3377L12.2733 13.0263L11.5033 9.86842L14.0933 7.76316L10.6867 7.47807L9.33333 4.49561L7.98 7.45614L4.57333 7.74123L7.16333 9.86842L6.39333 13.0044ZM3.57 16.6667L5.08667 10.5044L0 6.35965L6.72 5.8114L9.33333 0L11.9467 5.8114L18.6667 6.35965L13.58 10.5044L15.0967 16.6667L9.33333 13.3991L3.57 16.6667Z" fill="#7D7D7D" />
              </svg>
            </Button>
            <HoverText>Grading</HoverText>
            </NavContainer>
          </Link>
          <Link to="/after_grading" style={{ textDecoration: 'none' }}>
          <NavContainer className='not-selected'>
            <Button
              loading="lazy"
            ><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#7D7D7D"><path d="M160-120q-33 0-56.5-23.5T80-200v-560q0-33 23.5-56.5T160-840h640q33 0 56.5 23.5T880-760v560q0 33-23.5 56.5T800-120H160Zm0-80h640v-560H160v560Zm40-80h200v-80H200v80Zm382-80 198-198-57-57-141 142-57-57-56 57 113 113Zm-382-80h200v-80H200v80Zm0-160h200v-80H200v80Zm-40 400v-560 560Z"/></svg>
            </Button>
            <HoverText>After Grading</HoverText>
            </NavContainer>
          </Link>
          <Link to="/assigned" style={{ textDecoration: 'none' }}>
          <NavContainer className='not-selected'>
            <Button
              loading="lazy"
            ><svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.75556 13.3778L13.0222 7.11111L11.7778 5.86667L6.75556 10.8889L4.22222 8.35556L2.97778 9.6L6.75556 13.3778ZM1.77778 17.7778C1.28889 17.7778 0.87037 17.6037 0.522222 17.2556C0.174074 16.9074 0 16.4889 0 16V3.55556C0 3.06667 0.174074 2.64815 0.522222 2.3C0.87037 1.95185 1.28889 1.77778 1.77778 1.77778H5.51111C5.7037 1.24444 6.02593 0.814815 6.47778 0.488889C6.92963 0.162963 7.43704 0 8 0C8.56296 0 9.07037 0.162963 9.52222 0.488889C9.97407 0.814815 10.2963 1.24444 10.4889 1.77778H14.2222C14.7111 1.77778 15.1296 1.95185 15.4778 2.3C15.8259 2.64815 16 3.06667 16 3.55556V16C16 16.4889 15.8259 16.9074 15.4778 17.2556C15.1296 17.6037 14.7111 17.7778 14.2222 17.7778H1.77778ZM1.77778 16H14.2222V3.55556H1.77778V16ZM8 2.88889C8.19259 2.88889 8.35185 2.82593 8.47778 2.7C8.6037 2.57407 8.66667 2.41481 8.66667 2.22222C8.66667 2.02963 8.6037 1.87037 8.47778 1.74444C8.35185 1.61852 8.19259 1.55556 8 1.55556C7.80741 1.55556 7.64815 1.61852 7.52222 1.74444C7.3963 1.87037 7.33333 2.02963 7.33333 2.22222C7.33333 2.41481 7.3963 2.57407 7.52222 2.7C7.64815 2.82593 7.80741 2.88889 8 2.88889Z" fill="#7D7D7D" />
              </svg>
            </Button>
            <HoverText>Assigned</HoverText>
            </NavContainer>
          </Link>

          <Link to="/proposals" style={{ textDecoration: 'none' }}>
          <NavContainer className='not-selected'>
            <Button
              loading="lazy"
            ><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#7D7D7D"><path d="M320-280q17 0 28.5-11.5T360-320q0-17-11.5-28.5T320-360q-17 0-28.5 11.5T280-320q0 17 11.5 28.5T320-280Zm0-160q17 0 28.5-11.5T360-480q0-17-11.5-28.5T320-520q-17 0-28.5 11.5T280-480q0 17 11.5 28.5T320-440Zm0-160q17 0 28.5-11.5T360-640q0-17-11.5-28.5T320-680q-17 0-28.5 11.5T280-640q0 17 11.5 28.5T320-600Zm120 320h240v-80H440v80Zm0-160h240v-80H440v80Zm0-160h240v-80H440v80ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0-560v560-560Z"/></svg>
            </Button>
            <HoverText>Proposals</HoverText>
            </NavContainer>
          </Link>
          
          <Link to="/proposers" style={{ textDecoration: 'none' }}>
          <NavContainer className='selected'>
            <Button className='selected'
              loading="lazy"
            ><svg width="18" height="14" viewBox="0 0 18 14" fill='none' xmlns="http://www.w3.org/2000/svg">
                <path d="M13.1665 9.50004C12.5832 9.50004 12.0901 9.29865 11.6873 8.89587C11.2846 8.4931 11.0832 8.00004 11.0832 7.41671C11.0832 6.83337 11.2846 6.34032 11.6873 5.93754C12.0901 5.53476 12.5832 5.33337 13.1665 5.33337C13.7498 5.33337 14.2429 5.53476 14.6457 5.93754C15.0484 6.34032 15.2498 6.83337 15.2498 7.41671C15.2498 8.00004 15.0484 8.4931 14.6457 8.89587C14.2429 9.29865 13.7498 9.50004 13.1665 9.50004ZM8.99984 13.6667V12.5C8.99984 12.1667 9.08664 11.8577 9.26025 11.573C9.43386 11.2882 9.68039 11.0834 9.99984 10.9584C10.4998 10.75 11.0172 10.5938 11.5519 10.4896C12.0866 10.3855 12.6248 10.3334 13.1665 10.3334C13.7082 10.3334 14.2464 10.3855 14.7811 10.4896C15.3158 10.5938 15.8332 10.75 16.3332 10.9584C16.6526 11.0834 16.8991 11.2882 17.0728 11.573C17.2464 11.8577 17.3332 12.1667 17.3332 12.5V13.6667H8.99984ZM7.33317 7.00004C6.4165 7.00004 5.63178 6.67365 4.979 6.02087C4.32623 5.3681 3.99984 4.58337 3.99984 3.66671C3.99984 2.75004 4.32623 1.96532 4.979 1.31254C5.63178 0.659763 6.4165 0.333374 7.33317 0.333374C8.24984 0.333374 9.03456 0.659763 9.68734 1.31254C10.3401 1.96532 10.6665 2.75004 10.6665 3.66671C10.6665 4.58337 10.3401 5.3681 9.68734 6.02087C9.03456 6.67365 8.24984 7.00004 7.33317 7.00004ZM0.666504 13.6667V11.3334C0.666504 10.8612 0.784559 10.4271 1.02067 10.0313C1.25678 9.63546 1.58317 9.33337 1.99984 9.12504C2.83317 8.70837 3.69775 8.38893 4.59359 8.16671C5.48942 7.94448 6.40261 7.83337 7.33317 7.83337C7.81928 7.83337 8.30539 7.87504 8.7915 7.95837C9.27761 8.04171 9.76373 8.13893 10.2498 8.25004L9.5415 8.95837L8.83317 9.66671C8.58317 9.59726 8.33317 9.55212 8.08317 9.53129C7.83317 9.51046 7.58317 9.50004 7.33317 9.50004C6.52761 9.50004 5.73942 9.59726 4.96859 9.79171C4.19775 9.98615 3.45817 10.2639 2.74984 10.625C2.61095 10.6945 2.50678 10.7917 2.43734 10.9167C2.36789 11.0417 2.33317 11.1806 2.33317 11.3334V12H7.33317V13.6667H0.666504ZM7.33317 5.33337C7.7915 5.33337 8.18386 5.17018 8.51025 4.84379C8.83664 4.5174 8.99984 4.12504 8.99984 3.66671C8.99984 3.20837 8.83664 2.81601 8.51025 2.48962C8.18386 2.16324 7.7915 2.00004 7.33317 2.00004C6.87484 2.00004 6.48248 2.16324 6.15609 2.48962C5.8297 2.81601 5.6665 3.20837 5.6665 3.66671C5.6665 4.12504 5.8297 4.5174 6.15609 4.84379C6.48248 5.17018 6.87484 5.33337 7.33317 5.33337Z" fill="#363636" />
              </svg>
            </Button>
            <HoverText><b>Proposers</b></HoverText>
            </NavContainer>
          </Link>

          <Link to="/settings/profile" style={{ textDecoration: 'none' }}>
          <NavContainer className='not-selected'>
            <Button
              loading="lazy"
            ><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z" fill="#7D7D7D"/></svg>
            </Button>
            <HoverText>Settings</HoverText>
            </NavContainer>
          </Link>
          </NavBar>
        </Div3>}
        
        {userRole === 'proposer' && <Div3>
        <Link to={"/main"}>
          <LogoKaizen src="https://cdn.builder.io/api/v1/image/assets/TEMP/3905e52e9c6b961ec6717c80409232f3222eab9fc52b8caf2e55d314ff83b93e?apiKey=76bc4e76ba824cf091e9566ff1ae9339&" alt="KaizenCloud Logo" />
          </Link>
          <NavBar>
          <Link to="/add_proposal" style={{ textDecoration: 'none', marginTop: 57, cursor: 'pointer'}}>
            <NavContainer className='not-selected'>
            <Button
              loading="lazy"
            > <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#7D7D7D"><path d="M723.59-192v-92.41h-92.42v-79.18h92.42V-456h79.17v92.41h92.41v79.18h-92.41V-192h-79.17Zm-552 56.13q-33.79 0-58.39-24.61-24.61-24.61-24.61-58.39v-522.26q0-34.48 24.61-58.74 24.6-24.26 58.39-24.26h522.02q34.48 0 58.74 24.26 24.26 24.26 24.26 58.74v216.72h-83v-92.89H171.59v398.43h486v83h-486Zm0-553.43h522.02v-51.83H171.59v51.83Zm0 0v-51.83 51.83Z"/></svg>
            </Button>
            <HoverText>Add Proposal</HoverText>
            </NavContainer>
          </Link>
          <Link to={`/profile/${userData.proposer.id}`} style={{textDecoration: 'none', color: '#333'}}> 
            <NavContainer className='not-selected'>
            <Button
              loading="lazy"
            >
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#7D7D7D"><path d="M480-484.07q-63.59 0-107.86-44.27-44.27-44.27-44.27-107.86 0-63.58 44.27-107.74 44.27-44.15 107.86-44.15 63.59 0 107.86 44.15 44.27 44.16 44.27 107.74 0 63.59-44.27 107.86-44.27 44.27-107.86 44.27ZM183.87-179.8v-104.61q0-25.23 13.74-47.59 13.74-22.37 37.8-37.35 55.72-32.24 117.96-49.48 62.24-17.24 126.42-17.24 64.64 0 127.1 17.12 62.46 17.12 117.7 49.36 24.06 13.95 37.8 36.75 13.74 22.8 13.74 48.41v104.63H183.87Zm83-83h426.26v-20.42q0-4.94-3.02-8.99-3.03-4.04-7.98-6.29-44.56-27.04-95.85-40.8Q535-353.07 480-353.07q-54.52 0-106.28 13.77-51.76 13.76-95.85 40.8-5 3.89-8 7.43-3 3.53-3 7.85v20.42ZM480.2-567.07q28.6 0 48.77-20.36 20.16-20.37 20.16-48.97 0-28.6-20.37-48.64-20.36-20.05-48.96-20.05t-48.77 20.3q-20.16 20.3-20.16 48.81 0 28.6 20.37 48.76 20.36 20.15 48.96 20.15Zm-.2-69.13Zm0 373.4Z"/></svg>
            </Button>
            <HoverText>Profile</HoverText>
            </NavContainer>
          </Link>
          <Link to="/assigned" style={{ textDecoration: 'none' }}>
            <NavContainer className='not-selected'>
            <Button
              loading="lazy"
            ><svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.75556 13.3778L13.0222 7.11111L11.7778 5.86667L6.75556 10.8889L4.22222 8.35556L2.97778 9.6L6.75556 13.3778ZM1.77778 17.7778C1.28889 17.7778 0.87037 17.6037 0.522222 17.2556C0.174074 16.9074 0 16.4889 0 16V3.55556C0 3.06667 0.174074 2.64815 0.522222 2.3C0.87037 1.95185 1.28889 1.77778 1.77778 1.77778H5.51111C5.7037 1.24444 6.02593 0.814815 6.47778 0.488889C6.92963 0.162963 7.43704 0 8 0C8.56296 0 9.07037 0.162963 9.52222 0.488889C9.97407 0.814815 10.2963 1.24444 10.4889 1.77778H14.2222C14.7111 1.77778 15.1296 1.95185 15.4778 2.3C15.8259 2.64815 16 3.06667 16 3.55556V16C16 16.4889 15.8259 16.9074 15.4778 17.2556C15.1296 17.6037 14.7111 17.7778 14.2222 17.7778H1.77778ZM1.77778 16H14.2222V3.55556H1.77778V16ZM8 2.88889C8.19259 2.88889 8.35185 2.82593 8.47778 2.7C8.6037 2.57407 8.66667 2.41481 8.66667 2.22222C8.66667 2.02963 8.6037 1.87037 8.47778 1.74444C8.35185 1.61852 8.19259 1.55556 8 1.55556C7.80741 1.55556 7.64815 1.61852 7.52222 1.74444C7.3963 1.87037 7.33333 2.02963 7.33333 2.22222C7.33333 2.41481 7.3963 2.57407 7.52222 2.7C7.64815 2.82593 7.80741 2.88889 8 2.88889Z" fill="#7D7D7D" />
              </svg>
            </Button>
            <HoverText>Assigned</HoverText>
            </NavContainer>
          </Link>
          
          <Link to="/proposals" style={{ textDecoration: 'none' }}>
            <NavContainer className='not-selected'>
            <Button
              loading="lazy"
            ><svg width="17" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.66667 16.394C1.20833 16.394 0.815972 16.2367 0.489583 15.9222C0.163194 15.6077 0 15.2296 0 14.7879V3.5455C0 3.10383 0.163194 2.72574 0.489583 2.41121C0.815972 2.09669 1.20833 1.93943 1.66667 1.93943H5.16667C5.34722 1.45762 5.64931 1.06949 6.07292 0.775041C6.49653 0.480596 6.97222 0.333374 7.5 0.333374C8.02778 0.333374 8.50347 0.480596 8.92708 0.775041C9.35069 1.06949 9.65278 1.45762 9.83333 1.93943H13.3333C13.7917 1.93943 14.184 2.09669 14.5104 2.41121C14.8368 2.72574 15 3.10383 15 3.5455V8.9258C14.7361 8.80534 14.4653 8.70162 14.1875 8.61462C13.9097 8.52763 13.625 8.46406 13.3333 8.4239V3.5455H1.66667V14.7879H6.70833C6.75 15.0824 6.81597 15.3634 6.90625 15.6311C6.99653 15.8988 7.10417 16.1531 7.22917 16.394H1.66667ZM1.66667 13.9849V14.7879V3.5455V8.4239V8.36368V13.9849ZM3.33333 13.1819H6.72917C6.77083 12.9008 6.83681 12.6264 6.92708 12.3588C7.01736 12.0911 7.11806 11.8301 7.22917 11.5758H3.33333V13.1819ZM3.33333 9.96974H8.41667C8.86111 9.56822 9.35764 9.23363 9.90625 8.96595C10.4549 8.69827 11.0417 8.51759 11.6667 8.4239V8.36368H3.33333V9.96974ZM3.33333 6.75762H11.6667V5.15156H3.33333V6.75762ZM7.5 2.94322C7.68055 2.94322 7.82986 2.88634 7.94792 2.77258C8.06597 2.65882 8.125 2.51494 8.125 2.34095C8.125 2.16696 8.06597 2.02308 7.94792 1.90932C7.82986 1.79556 7.68055 1.73868 7.5 1.73868C7.31944 1.73868 7.17014 1.79556 7.05208 1.90932C6.93403 2.02308 6.875 2.16696 6.875 2.34095C6.875 2.51494 6.93403 2.65882 7.05208 2.77258C7.17014 2.88634 7.31944 2.94322 7.5 2.94322ZM12.5 18C11.3472 18 10.3646 17.6086 9.55208 16.8256C8.73958 16.0427 8.33333 15.0957 8.33333 13.9849C8.33333 12.874 8.73958 11.9271 9.55208 11.1442C10.3646 10.3612 11.3472 9.96974 12.5 9.96974C13.6528 9.96974 14.6354 10.3612 15.4479 11.1442C16.2604 11.9271 16.6667 12.874 16.6667 13.9849C16.6667 15.0957 16.2604 16.0427 15.4479 16.8256C14.6354 17.6086 13.6528 18 12.5 18ZM12.0833 16.394H12.9167V14.3864H15V13.5834H12.9167V11.5758H12.0833V13.5834H10V14.3864H12.0833V16.394Z" fill="#7D7D7D" />
              </svg>
            </Button>
            <HoverText>Proposals</HoverText>
            </NavContainer>
          </Link>
          
          <Link to="/proposers" style={{ textDecoration: 'none' }}>
            <NavContainer className='selected'>
            <Button className='selected'
              loading="lazy"
            ><svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.1665 9.50004C12.5832 9.50004 12.0901 9.29865 11.6873 8.89587C11.2846 8.4931 11.0832 8.00004 11.0832 7.41671C11.0832 6.83337 11.2846 6.34032 11.6873 5.93754C12.0901 5.53476 12.5832 5.33337 13.1665 5.33337C13.7498 5.33337 14.2429 5.53476 14.6457 5.93754C15.0484 6.34032 15.2498 6.83337 15.2498 7.41671C15.2498 8.00004 15.0484 8.4931 14.6457 8.89587C14.2429 9.29865 13.7498 9.50004 13.1665 9.50004ZM8.99984 13.6667V12.5C8.99984 12.1667 9.08664 11.8577 9.26025 11.573C9.43386 11.2882 9.68039 11.0834 9.99984 10.9584C10.4998 10.75 11.0172 10.5938 11.5519 10.4896C12.0866 10.3855 12.6248 10.3334 13.1665 10.3334C13.7082 10.3334 14.2464 10.3855 14.7811 10.4896C15.3158 10.5938 15.8332 10.75 16.3332 10.9584C16.6526 11.0834 16.8991 11.2882 17.0728 11.573C17.2464 11.8577 17.3332 12.1667 17.3332 12.5V13.6667H8.99984ZM7.33317 7.00004C6.4165 7.00004 5.63178 6.67365 4.979 6.02087C4.32623 5.3681 3.99984 4.58337 3.99984 3.66671C3.99984 2.75004 4.32623 1.96532 4.979 1.31254C5.63178 0.659763 6.4165 0.333374 7.33317 0.333374C8.24984 0.333374 9.03456 0.659763 9.68734 1.31254C10.3401 1.96532 10.6665 2.75004 10.6665 3.66671C10.6665 4.58337 10.3401 5.3681 9.68734 6.02087C9.03456 6.67365 8.24984 7.00004 7.33317 7.00004ZM0.666504 13.6667V11.3334C0.666504 10.8612 0.784559 10.4271 1.02067 10.0313C1.25678 9.63546 1.58317 9.33337 1.99984 9.12504C2.83317 8.70837 3.69775 8.38893 4.59359 8.16671C5.48942 7.94448 6.40261 7.83337 7.33317 7.83337C7.81928 7.83337 8.30539 7.87504 8.7915 7.95837C9.27761 8.04171 9.76373 8.13893 10.2498 8.25004L9.5415 8.95837L8.83317 9.66671C8.58317 9.59726 8.33317 9.55212 8.08317 9.53129C7.83317 9.51046 7.58317 9.50004 7.33317 9.50004C6.52761 9.50004 5.73942 9.59726 4.96859 9.79171C4.19775 9.98615 3.45817 10.2639 2.74984 10.625C2.61095 10.6945 2.50678 10.7917 2.43734 10.9167C2.36789 11.0417 2.33317 11.1806 2.33317 11.3334V12H7.33317V13.6667H0.666504ZM7.33317 5.33337C7.7915 5.33337 8.18386 5.17018 8.51025 4.84379C8.83664 4.5174 8.99984 4.12504 8.99984 3.66671C8.99984 3.20837 8.83664 2.81601 8.51025 2.48962C8.18386 2.16324 7.7915 2.00004 7.33317 2.00004C6.87484 2.00004 6.48248 2.16324 6.15609 2.48962C5.8297 2.81601 5.6665 3.20837 5.6665 3.66671C5.6665 4.12504 5.8297 4.5174 6.15609 4.84379C6.48248 5.17018 6.87484 5.33337 7.33317 5.33337Z"  fill='#363636' />
              </svg>
            </Button>
            <HoverText>Proposers</HoverText>
            </NavContainer>
          </Link>

          <Link to="/settings/profile" style={{ textDecoration: 'none' }}>
            <NavContainer >
            <Button className='not-selected'
              loading="lazy"
            ><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z" fill="#7D7D7D"/></svg>
            </Button>
            <HoverText className='selected'>Settings</HoverText>
            </NavContainer>
          </Link>
          </NavBar>
        </Div3>}
        <Div4>
          <Div5>
            <Div6>Company name</Div6>
            <Div51>
              <LanguageSelectorWrapper onClick={() => setIsOpen(!isOpen)}>
                <LanguageCode>
                  {selectedLanguage}
                </LanguageCode>
                <LanguagePolygon
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/69cb4c3f10bd0f7645f561142580659d248d57013fd8dbb5c0398dc17e52ffff?apiKey=f933b1b419864e2493a2da58c5eeea0a&"
                  alt="Language selector icon"
                  
                />
                {isOpen && (
                  <LanguageDropdown>
                    {filteredLanguages.map(language => (
                      <LanguageOption key={language} onClick={() => handleLanguageClick(language)}>
                        {language}
                      </LanguageOption>
                    ))}
                  </LanguageDropdown>
                )}
              </LanguageSelectorWrapper>
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
            </Div51>
            
          </Div5>
          <ContainerAndCardWrapper>
          <Container>
              
              <Header>
                <HeaderWrapper className='proposersText'>Proposers</HeaderWrapper>
              </Header>
              <TableWrapper>
              <SearchInput>
                <SearchIcon src={searchIconSvg} alt="Search icon" />
                <input
                  type="text"
                  className='search_input'
                  value={query}
                  onChange={searchInputChange}
                  placeholder="Search"
                />
              </SearchInput>
              <TableHeaderPlace>
              <TableHeader>
                  <TableHeaderLabel className="header_number">№</TableHeaderLabel>
                  <TableHeaderLabel className="header_name">Name</TableHeaderLabel>
                  <TableHeaderLabel className="header_surname">Surname</TableHeaderLabel>
                  <TableHeaderLabel className="header_proposals">Profile</TableHeaderLabel>
              </TableHeader>
              </TableHeaderPlace>
              <Table>
              <TableBody>
              {Object.values(proposersData).map((item, index) => (
                <TableRow key={item.id} onClick={() => handleTableRowClick(index)}>
                  <TableRowLabel className="row_number">{++rowNum}</TableRowLabel>
                  <TableRowLabel className="row_name">{item.user.first_name}</TableRowLabel>
                  <TableRowLabel className="row_surname">{item.user.last_name}</TableRowLabel>
                  <TableRowLabel className="row_proposal"><Link to={"/profile/" + item.id} style={{ textDecoration: 'none', color: 'black' }}>Open Profile</Link></TableRowLabel>
                </TableRow>
              ))}
              </TableBody>
              </Table>
              </TableWrapper>
          </Container> 

          <ProposerProfile>
          <ProfileInfoLabel>
            Proposer Information
          </ProfileInfoLabel>
          <Divider />
          <ProposerInfo>
          <ProposerInfoImg
                  srcSet={currentProposerImg || Avatar}
                  alt="Person Image"
                  width="140"
                  height="140"
                />
          <ProposerDetails> 
              <ProposerDetailInfo className='first'>
              <ProposerDetail className='label'>Fullname</ProposerDetail>
              <ProposerDetail className='label'>Email</ProposerDetail>
              <ProposerDetail className='label'>Phone number</ProposerDetail>
              </ProposerDetailInfo>

              <ProposerDetailInfo>
              <ProposerDetail className='label-info'> {proposersData[currentProposer].user.first_name} {proposersData[currentProposer].user.last_name}</ProposerDetail>
              <ProposerDetail className='label-info'><a href={'maito:' + proposersData[currentProposer].user.email}>{proposersData[currentProposer].user.email}</a> </ProposerDetail>
              <ProposerDetail className='label-info'> {proposersData[currentProposer].user.phone_number || '???'}</ProposerDetail>
              </ProposerDetailInfo>
          </ProposerDetails>
          </ProposerInfo>
          <ProfileInfoLabel className='proposals'>Proposals</ProfileInfoLabel>
          <ProposalInfoWrapper>
              {proposerProposals && proposerProposals[currentProposal] ? (
                <>
                <ProposalTitle>
                {proposerProposals[currentProposal].title || "No title available"}
                </ProposalTitle>
              <ProposalDescription>
              {proposerProposals[currentProposal].text || "No description available"}
              </ProposalDescription>
              <ProposalDate>{ proposerProposals[currentProposal].created_at ? 
                proposerProposals[currentProposal].created_at.split('T')[0] : "No date available"}</ProposalDate>
              <ProposalStatus>{proposerProposals[currentProposal].status || "No status available"}</ProposalStatus>
                </>
              ) : (
                <p>No proposal details available.</p>
              )}
              <ProposalNumber>{currentProposal+1} / {proposerProposals.length}</ProposalNumber>
          </ProposalInfoWrapper>
          {proposerProposals && proposerProposals[currentProposal] ? (
                <ProposalButtons>
                <PreviousProposalButton 
                  onClick={handlePreviousProposal} 
                  disabled={currentProposal === 0}>
                  Back
                </PreviousProposalButton>
                <NextProposalButton 
                  onClick={handleNextProposal} 
                  disabled={currentProposal === proposerProposals.length - 1}>
                  Next
                </NextProposalButton>
                </ProposalButtons>
              ) : (<></>)}
          </ProposerProfile>
          </ContainerAndCardWrapper>
        </Div4>
      </Div2>
    </Div>
  );
}


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

const getStatusColor = (status) => {
  switch(status) {
    case 'New':
      return '#1871ED';
    case 'Accepted':
      return '#63BE09';
    case 'Declined':
      return '#BE2A09';
    case 'Graded':
      return '#1871ED';
    case 'In progress':
      return '#63BE09';
    case 'Done':
      return '#7CE68A';
    case 'Archived':
      return '#C9C2C1';
    default:
      return '';
  }
};

const LogoKaizen = styled.img`
  padding-left: 5px;
  aspect-ratio: 1.12;
  object-fit: contain;
  object-position: center;
  width: 43px;
`;

const Div = styled.div`
  background-color: #fff;
  display: flex;
  margin: 0px;
  flex-direction: column;
  justify-content: center;
`;
const Div2 = styled.div`
  background-color: #f2f2f2;
  display: flex;
  padding-right: 10px;
  justify-content: space-between;
  gap: 11px;
  @media (max-width: 991px) {
    max-width: 100%;
    flex-wrap: wrap;
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

const Div51 = styled.div`
  display: flex;
  `;

const LanguageSelectorWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  margin-right: 16px;
  gap: 10px;
  padding: 10px;
  border: 1px solid rgba(215, 215, 215, 1);
  border-radius: 8px;
  background-color: #fff;
  font-size: 16px;
  color: #525252;
  font-weight: 400;
  white-space: nowrap;
  cursor: pointer;
`;

const LanguageCode = styled.span`
  font-family: Roboto, sans-serif;
`;

const LanguagePolygon = styled.img`
  width: 15px;
  aspect-ratio: 1.89;
  object-fit: contain;
  fill: #434343;
`;

const LanguageDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: #fff;
  border: 1px solid rgba(215, 215, 215, 1);
  border-radius: 8px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const LanguageOption = styled.div`
  font-family: Roboto, sans-serif;
  font-size: 16px;
  color: #525252;
  cursor: pointer;

  &:hover {
    color: #000;
  }
`;
const DropdownWrapper = styled.div`
  width: 160px;
  z-index: 15;
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

const ContainerAndCardWrapper = styled.div`
  margin-top: 34px;
  gap: 50px;
  width: 100%;
  display: flex;
`;

const ProposerProfile = styled.div`
  padding: 15px 25px;
  border-radius: 15px;
  width: 100%;
  margin-right: 50px;
  height: 80vh;

  background-color: #fff;
`;

const ProposalButtons = styled.div`
    display: flex;
    width: 100%;
    margin-top: 10px;
    justify-content: center;
`;

const NextProposalButton = styled.button`
  background-color: #fff;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  outline: none;
  border: 2px solid #9c9c9c;
  margin-left: 10px;
  padding: 10px 20px;
  &:hover {
    background-color: #f2f2f2;
  }
`;

const PreviousProposalButton = styled.button`
  background-color: #fff;
  border-radius: 5px;
  cursor: pointer;
  border: 2px solid #9c9c9c;
  font-size: 16px;
  padding: 10px 20px;
  &:hover {
    background-color: #f2f2f2;
  }
`;

const ProfileInfoLabel = styled.div`
  margin-top: 20px;
  font-size: 26px;
  color: #363636;
  @media (max-width: 991px) {
    max-width: 100%;
  }
  &.proposals {
    text-align: center;
    margin-bottom: 20px;
  }
`;

const ProposalInfoWrapper = styled.div`
  display: flex;
  position: relative;
  flex-direction: column;
  background-color: #ebeced;
  padding: 15px;
  height: 25vh;
  border-radius: 15px;
  gap: 20px;
`;
const ProposalTitle = styled.div`
  display: flex;
  font-weight: 600;
`;

const ProposalDescription = styled.div`
  display: flex;
`;
const ProposalDate = styled.div`
  position: absolute;
  right: 10px;
`;
const ProposalNumber = styled.div`
  position: absolute;
  right: 15px;
  bottom: -30px;
`;
const ProposalStatus = styled.div`
  position: absolute;
  right: 150px;
  top: 0;
  background-color: #fcfcfc;
  border: 2px solid #e3e3e3;
  border-bottom-right-radius: 5px;
  border-bottom-left-radius: 5px;
  padding: 15px 15px 5px 15px;
`;
const ProposerInfo = styled.div`
  display: flex;
  margin-top: 20px;
`;
const ProposerInfoImg = styled.img`
  border-radius: 50%;
  aspect-ratio: 1;
  object-fit: auto;
  object-position: center;
  width: 140px;
`;
const ProposerDetails = styled.div`
  display: flex;
  font-size: 21px;
  margin-top: 20px;
  margin-left: 30px;
  gap: 30px;
`;
const ProposerDetail = styled.div`
  &.label{
    color: #808080;
  }
  &.label-info{

  }
  display: flex;
`;

const ProposerDetailInfo = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;

  gap: 15px;
  &.first::after {
  content: '';
  position: absolute;
  right: -15px;
  width: 2px;
  height: 100%;
  background-color: #d3d3d3;
  }
`;

const Container = styled.div`
  width: 420px;
  display: flex;
  flex-direction: column;
  fill: #fff;
  filter: drop-shadow(0px 0px 10px rgba(0, 0, 0, 0.2));
  position: relative;
  padding-bottom: 8px;
`;

const NavContainer = styled.div`
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

const Header = styled.header`
  display: flex;
  gap: 15px;
  font-size: 16px;
  font-weight: 500;
  
  @media (max-width: 991px) {
    flex-wrap: wrap;
  }
`;

const HeaderWrapper = styled.div`
  border-radius: 8px 8px 0px 0px;
  background-color: #fafafa;
  font-weight: bold;
  display: flex;
  justify-content: center;
  color: #6c6c6c;
  
  &.proposersText {
    width: 100%;
    padding: 10px 0;
    font-size: 20px;
    color: #1871ed;
    font-family: Roboto, sans-serif;
    margin: auto 0;
  }
  @media (max-width: 991px) {
    flex-wrap: wrap;
  }
`;

const Divider = styled.div`
  position: relative;
  background-color: #d3d3d3;
  height: 1px;
  margin-top: 10px;
  width: 100%;
  
  @media (max-width: 991px) {
    max-width: 100%;
  }
`;
const TableWrapper = styled.div`
  background-color: #fafafa;
  border-bottom-left-radius: 10px;
`;

const SearchInput = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
  margin: 0 30px 0 15px;
  border: 1px solid #D3D3D3;
  padding: 5px 0 5px 15px;
  background-color: #fff;
  border-radius: 8px;
    
  @media (max-width: 991px) {
    flex-wrap: wrap;
  }
`;

const SearchIcon = styled.img`
  width: 16px;
  height: 16px;
`;

const Table = styled.div`
  overflow: auto;
  background-color: #fafafa;
  height: 65vh;
  border-radius: 0 8px 8px 8px;
`;
const TableHeaderPlace = styled.div`
  padding-top: 5px;
  background-color: #fafafa;
  height: 33px;
`;

const TableHeader = styled.div`
  position: relative;
  display: flex;
  font-size: 12px;
  color: #434343;
  font-weight: 500;
  
  @media (max-width: 991px) {
    max-width: 100%;
    flex-wrap: wrap;
    padding-right: 20px;
  }
`;

const TableRowLabel = styled.div`
border: 1px solid #d3d3d3;
font-family: Roboto, sans-serif;
font-size: 11px;
display:flex;
align-items: center;
justify-content: center;
&.row_number {
  margin-left: 25px;
  min-width: 30px;
}

&.row_name {
  padding-left: 10px;
  justify-content: start;
  width: 90px;
}

&.row_surname {
  padding-left: 13px;
  justify-content: start;
  width: 90px;
}

&.row_proposal {
  padding: 7px 0 7px 17px;
  justify-content: start;
  width: 100px;
  line-height: 1.5;
}
`;

const TableHeaderLabel = styled.div`
  border: 1px solid #d3d3d3;
  font-family: Roboto, sans-serif;
  display:flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  &.header_number {
    margin-left: 25px;
    min-width: 30px;
  }

  &.header_name {
    padding-left: 10px;
    justify-content: start;
    width: 90px;
  }

  &.header_surname {
    padding-left: 13px;
    justify-content: start;
    width: 90px;
  }

  &.header_proposals {
    padding: 7px 0 7px 17px;
    justify-content: start;
    width: 100px;
    line-height: 1.5;
  }

`;




const TableBody = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;  
  @media (max-width: 991px) {
    margin-right: 5px;
  }
`;

const TableRow = styled.div`
  display: flex;
  
  &:hover {
    cursor: pointer;
    background-color: #f0f0f0;
  }
  @media (max-width: 991px) {
    max-width: 100%;
    flex-wrap: wrap;
  }
`;


export default ProposersComponent;