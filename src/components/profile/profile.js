import React, {useState, useEffect} from "react";
import styled from "styled-components";
import Logo from '../../images/User-512.webp';
import { Link } from 'react-router-dom';
import { getImageById, fetchUserData, fetchProposalsByID, fetchProposersData, getProposerById, fetchProposalData } from "../../services/apiService";
import { ContributionCalendar, createTheme } from "react-contribution-calendar";
import Spinner from '../spinner/spinner';
import Avatar from '../../images/User-512.webp';
import Select from 'react-select';
import { useParams } from 'react-router-dom';


export const logOut = () => {
  localStorage.removeItem('accessToken');
  window.location.href = "../login";
};



const customTheme = createTheme({
  level0: '#d0e1eb',
  level1: '#b6ddf4',
  level2: '#74a0ca',
  level3: '#0161a6',
  level4: '#154373',
});

const years = [
  { value: '2025', label: '2025' },
  { value: '2024', label: '2024' },
  { value: '2023', label: '2023' },
  { value: '2022', label: '2022' },
  { value: '2021', label: '2021' },
  { value: '2020', label: '2020' }
]


const data = [
  {
    id: 1,
    name: "Adil Sissenov",
    image: "https://cdn.builder.io/api/v1/image/assets/TEMP/c2a3a5c7a159d00f3f76413741945156f0dbc1cf972b7d109ae5a439fb4fafe9?apiKey=76bc4e76ba824cf091e9566ff1ae9339&",
    awards: [
      { id: 1, image: "https://cdn.builder.io/api/v1/image/assets/TEMP/219d0239c213b406c20cf50b504208c4f7a16c3d5b20364f128e47f3dc5552a1?apiKey=76bc4e76ba824cf091e9566ff1ae9339&" },
      { id: 2, image: "https://cdn.builder.io/api/v1/image/assets/TEMP/2288abf5fb06b34a2001bee518e5d8f6b1dd83efec16ead3e887fd58ee253be9?apiKey=76bc4e76ba824cf091e9566ff1ae9339&" },
    ],
  },
];




function Header() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const { profileId } = useParams();
  const [selectedYear, setSelectedYear] = useState('2024');
  const [proposalsDataById, setProposalsData] = useState(null);
  const [error, setError] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
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

      const proposersData = await fetchProposersData();
      const profileDataResponse = await getProposerById(parseInt(profileId));
      const userDataResponse = await fetchUserData();
      const proposalsDataByIdResponse = await fetchProposalsByID(parseInt(profileId));
      
      console.log(proposalsDataByIdResponse)
      const transformedData = {};
      proposersData.forEach((item) => {
        transformedData[item.id] = item;
      });

      if(userDataResponse.is_proposer && userDataResponse.proposer.id === parseInt(profileId)){
        setIsOwner(true);
      }

      if (proposalsDataByIdResponse) {
        setProposalsData(proposalsDataByIdResponse);
      }

      if (profileDataResponse) {
        setProfileData(profileDataResponse);
      }
      if (userDataResponse) {
        if(userDataResponse.avatar){
          const imageResponse = await getImageById(userDataResponse.avatar);
          setImageSrc(imageResponse.image);
        }
        setUserData(userDataResponse);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <Spinner />;
  }

  const countProposalsByDate = () => {
    const countByDate = {};
    proposalsDataById.forEach(proposal => {
      const date = new Date(proposal.accepted_at);
      date.setDate(date.getDate()); // Adding 1 day
      const isoDate = date.toISOString().split('T')[0];
      countByDate[isoDate] = (countByDate[isoDate] || 0) + 1;
    });
    return countByDate;
  };

  const generateCalendarData = () => {
    const countByDate = countProposalsByDate();
    const calendarData = [];
    for (const date in countByDate) {
      const level = Math.min(countByDate[date], 4);
      const dataEntry = {
        [date]: {
          level: level
        }
      };
      calendarData.push(dataEntry);
    }
    return calendarData;
  };

  const formatDate = (createdAt) => {
    const date = new Date(createdAt);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}.${month}.${year}, ${hours}:${minutes}`;
  };

  const calendarData = generateCalendarData();

  const handleYearChange = (selectedOption) => {
    setSelectedYear(selectedOption.value);
  };

  const getLastCreatedProposal = () => {
    if (!proposalsDataById || proposalsDataById.length === 0) {
      return null;
    }
    const sortedProposals = proposalsDataById.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return sortedProposals[0];
  };

  const lastCreatedProposal = getLastCreatedProposal();

  let sumNew = 0;
  let sumAccepted = 0;
  let sumDeclined = 0;
  let sumArchived = 0;

  proposalsDataById.forEach(data => {
    switch (data.status) {
      case 'New':
        sumNew++;
        break;
      case 'Accepted':
        sumAccepted++;
        break;
      case 'Declined':
        sumDeclined++;
        break;
      case 'Archived':
        sumArchived++;
        break;
      default:
    }
  });

  return (
    <Container>
      <Main>
      {userRole === 'staff' && <Div3>
        <Link to={"/main"}>
          <LogoKaizen src="https://cdn.builder.io/api/v1/image/assets/TEMP/3905e52e9c6b961ec6717c80409232f3222eab9fc52b8caf2e55d314ff83b93e?apiKey=76bc4e76ba824cf091e9566ff1ae9339&" alt="KaizenCloud Logo" />
          </Link>
          <NavBar>
          <Link to="/slider" style={{ textDecoration: 'none', marginTop: 57}}>
            <Container className='not-selected'>
            <Button
              loading="lazy"
            ><svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4.16667 13.3333C3.93056 13.3333 3.73264 13.2535 3.57292 13.0937C3.41319 12.934 3.33333 12.7361 3.33333 12.5V10.8333H14.1667V3.33333H15.8333C16.0694 3.33333 16.2674 3.41319 16.4271 3.57292C16.5868 3.73264 16.6667 3.93056 16.6667 4.16667V16.6667L13.3333 13.3333H4.16667ZM0 12.5V0.833333C0 0.597222 0.0798611 0.399306 0.239583 0.239583C0.399306 0.0798611 0.597222 0 0.833333 0H11.6667C11.9028 0 12.1007 0.0798611 12.2604 0.239583C12.4201 0.399306 12.5 0.597222 12.5 0.833333V8.33333C12.5 8.56944 12.4201 8.76736 12.2604 8.92708C12.1007 9.08681 11.9028 9.16667 11.6667 9.16667H3.33333L0 12.5ZM10.8333 7.5V1.66667H1.66667V7.5H10.8333Z" fill="#7D7D7D" />
              </svg>
            </Button>
            <HoverText>Slider</HoverText>
            </Container>
          </Link>
          <Link to="/grading" style={{ textDecoration: 'none' }}>
          <Container className='not-selected'>
            <Button
              loading="lazy"
            ><svg width="19" height="17" viewBox="0 0 19 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.39333 13.0044L9.33333 11.3377L12.2733 13.0263L11.5033 9.86842L14.0933 7.76316L10.6867 7.47807L9.33333 4.49561L7.98 7.45614L4.57333 7.74123L7.16333 9.86842L6.39333 13.0044ZM3.57 16.6667L5.08667 10.5044L0 6.35965L6.72 5.8114L9.33333 0L11.9467 5.8114L18.6667 6.35965L13.58 10.5044L15.0967 16.6667L9.33333 13.3991L3.57 16.6667Z" fill="#7D7D7D" />
              </svg>
            </Button>
            <HoverText>Grading</HoverText>
            </Container>
          </Link>
          <Link to="/after_grading" style={{ textDecoration: 'none' }}>
          <Container className='not-selected'>
            <Button
              loading="lazy"
            ><svg width="19" height="20" viewBox="0 0 19 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M9.6189 5.87494C9.6189 5.5033 9.92017 5.20203 10.2918 5.20203H16.6251C16.9968 5.20203 17.2981 5.5033 17.2981 5.87494C17.2981 6.24658 16.9968 6.54786 16.6251 6.54786H10.2918C9.92017 6.54786 9.6189 6.24658 9.6189 5.87494Z" fill="#7D7D7D" />
                <path fillRule="evenodd" clipRule="evenodd" d="M1.70215 12.9999C1.70215 12.6283 2.00342 12.327 2.37507 12.327H8.7084C9.08004 12.327 9.38132 12.6283 9.38132 12.9999C9.38132 13.3716 9.08004 13.6729 8.7084 13.6729H2.37507C2.00342 13.6729 1.70215 13.3716 1.70215 12.9999Z" fill="#7D7D7D" />
                <path d="M7.125 5.875C7.125 7.18668 6.06168 8.25 4.75 8.25C3.43832 8.25 2.375 7.18668 2.375 5.875C2.375 4.56332 3.43832 3.5 4.75 3.5C6.06168 3.5 7.125 4.56332 7.125 5.875Z" fill="#7D7D7D" />
                <path d="M16.625 13C16.625 14.3117 15.5617 15.375 14.25 15.375C12.9383 15.375 11.875 14.3117 11.875 13C11.875 11.6883 12.9383 10.625 14.25 10.625C15.5617 10.625 16.625 11.6883 16.625 13Z" fill="#7D7D7D" />
              </svg>
            </Button>
            <HoverText>After Grading</HoverText>
            </Container>
          </Link>
          <Link to="/proposals" style={{ textDecoration: 'none' }}>
          <Container className='not-selected'>
            <Button
              loading="lazy"
            ><svg width="17" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.66667 16.394C1.20833 16.394 0.815972 16.2367 0.489583 15.9222C0.163194 15.6077 0 15.2296 0 14.7879V3.5455C0 3.10383 0.163194 2.72574 0.489583 2.41121C0.815972 2.09669 1.20833 1.93943 1.66667 1.93943H5.16667C5.34722 1.45762 5.64931 1.06949 6.07292 0.775041C6.49653 0.480596 6.97222 0.333374 7.5 0.333374C8.02778 0.333374 8.50347 0.480596 8.92708 0.775041C9.35069 1.06949 9.65278 1.45762 9.83333 1.93943H13.3333C13.7917 1.93943 14.184 2.09669 14.5104 2.41121C14.8368 2.72574 15 3.10383 15 3.5455V8.9258C14.7361 8.80534 14.4653 8.70162 14.1875 8.61462C13.9097 8.52763 13.625 8.46406 13.3333 8.4239V3.5455H1.66667V14.7879H6.70833C6.75 15.0824 6.81597 15.3634 6.90625 15.6311C6.99653 15.8988 7.10417 16.1531 7.22917 16.394H1.66667ZM1.66667 13.9849V14.7879V3.5455V8.4239V8.36368V13.9849ZM3.33333 13.1819H6.72917C6.77083 12.9008 6.83681 12.6264 6.92708 12.3588C7.01736 12.0911 7.11806 11.8301 7.22917 11.5758H3.33333V13.1819ZM3.33333 9.96974H8.41667C8.86111 9.56822 9.35764 9.23363 9.90625 8.96595C10.4549 8.69827 11.0417 8.51759 11.6667 8.4239V8.36368H3.33333V9.96974ZM3.33333 6.75762H11.6667V5.15156H3.33333V6.75762ZM7.5 2.94322C7.68055 2.94322 7.82986 2.88634 7.94792 2.77258C8.06597 2.65882 8.125 2.51494 8.125 2.34095C8.125 2.16696 8.06597 2.02308 7.94792 1.90932C7.82986 1.79556 7.68055 1.73868 7.5 1.73868C7.31944 1.73868 7.17014 1.79556 7.05208 1.90932C6.93403 2.02308 6.875 2.16696 6.875 2.34095C6.875 2.51494 6.93403 2.65882 7.05208 2.77258C7.17014 2.88634 7.31944 2.94322 7.5 2.94322ZM12.5 18C11.3472 18 10.3646 17.6086 9.55208 16.8256C8.73958 16.0427 8.33333 15.0957 8.33333 13.9849C8.33333 12.874 8.73958 11.9271 9.55208 11.1442C10.3646 10.3612 11.3472 9.96974 12.5 9.96974C13.6528 9.96974 14.6354 10.3612 15.4479 11.1442C16.2604 11.9271 16.6667 12.874 16.6667 13.9849C16.6667 15.0957 16.2604 16.0427 15.4479 16.8256C14.6354 17.6086 13.6528 18 12.5 18ZM12.0833 16.394H12.9167V14.3864H15V13.5834H12.9167V11.5758H12.0833V13.5834H10V14.3864H12.0833V16.394Z" fill="#000" />
              </svg>
            </Button>
            <HoverText><b>Proposals</b></HoverText>
            </Container>
          </Link>
          <Link to="/assigned" style={{ textDecoration: 'none' }}>
          <Container className='not-selected'>
            <Button
              loading="lazy"
            ><svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.75556 13.3778L13.0222 7.11111L11.7778 5.86667L6.75556 10.8889L4.22222 8.35556L2.97778 9.6L6.75556 13.3778ZM1.77778 17.7778C1.28889 17.7778 0.87037 17.6037 0.522222 17.2556C0.174074 16.9074 0 16.4889 0 16V3.55556C0 3.06667 0.174074 2.64815 0.522222 2.3C0.87037 1.95185 1.28889 1.77778 1.77778 1.77778H5.51111C5.7037 1.24444 6.02593 0.814815 6.47778 0.488889C6.92963 0.162963 7.43704 0 8 0C8.56296 0 9.07037 0.162963 9.52222 0.488889C9.97407 0.814815 10.2963 1.24444 10.4889 1.77778H14.2222C14.7111 1.77778 15.1296 1.95185 15.4778 2.3C15.8259 2.64815 16 3.06667 16 3.55556V16C16 16.4889 15.8259 16.9074 15.4778 17.2556C15.1296 17.6037 14.7111 17.7778 14.2222 17.7778H1.77778ZM1.77778 16H14.2222V3.55556H1.77778V16ZM8 2.88889C8.19259 2.88889 8.35185 2.82593 8.47778 2.7C8.6037 2.57407 8.66667 2.41481 8.66667 2.22222C8.66667 2.02963 8.6037 1.87037 8.47778 1.74444C8.35185 1.61852 8.19259 1.55556 8 1.55556C7.80741 1.55556 7.64815 1.61852 7.52222 1.74444C7.3963 1.87037 7.33333 2.02963 7.33333 2.22222C7.33333 2.41481 7.3963 2.57407 7.52222 2.7C7.64815 2.82593 7.80741 2.88889 8 2.88889Z" fill="#7D7D7D" />
              </svg>
            </Button>
            <HoverText>Assigned</HoverText>
            </Container>
          </Link>
          <Link to="/proposers" style={{ textDecoration: 'none' }}>
          <Container className='not-selected'>
            <Button
              loading="lazy"
            ><svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.1665 9.50004C12.5832 9.50004 12.0901 9.29865 11.6873 8.89587C11.2846 8.4931 11.0832 8.00004 11.0832 7.41671C11.0832 6.83337 11.2846 6.34032 11.6873 5.93754C12.0901 5.53476 12.5832 5.33337 13.1665 5.33337C13.7498 5.33337 14.2429 5.53476 14.6457 5.93754C15.0484 6.34032 15.2498 6.83337 15.2498 7.41671C15.2498 8.00004 15.0484 8.4931 14.6457 8.89587C14.2429 9.29865 13.7498 9.50004 13.1665 9.50004ZM8.99984 13.6667V12.5C8.99984 12.1667 9.08664 11.8577 9.26025 11.573C9.43386 11.2882 9.68039 11.0834 9.99984 10.9584C10.4998 10.75 11.0172 10.5938 11.5519 10.4896C12.0866 10.3855 12.6248 10.3334 13.1665 10.3334C13.7082 10.3334 14.2464 10.3855 14.7811 10.4896C15.3158 10.5938 15.8332 10.75 16.3332 10.9584C16.6526 11.0834 16.8991 11.2882 17.0728 11.573C17.2464 11.8577 17.3332 12.1667 17.3332 12.5V13.6667H8.99984ZM7.33317 7.00004C6.4165 7.00004 5.63178 6.67365 4.979 6.02087C4.32623 5.3681 3.99984 4.58337 3.99984 3.66671C3.99984 2.75004 4.32623 1.96532 4.979 1.31254C5.63178 0.659763 6.4165 0.333374 7.33317 0.333374C8.24984 0.333374 9.03456 0.659763 9.68734 1.31254C10.3401 1.96532 10.6665 2.75004 10.6665 3.66671C10.6665 4.58337 10.3401 5.3681 9.68734 6.02087C9.03456 6.67365 8.24984 7.00004 7.33317 7.00004ZM0.666504 13.6667V11.3334C0.666504 10.8612 0.784559 10.4271 1.02067 10.0313C1.25678 9.63546 1.58317 9.33337 1.99984 9.12504C2.83317 8.70837 3.69775 8.38893 4.59359 8.16671C5.48942 7.94448 6.40261 7.83337 7.33317 7.83337C7.81928 7.83337 8.30539 7.87504 8.7915 7.95837C9.27761 8.04171 9.76373 8.13893 10.2498 8.25004L9.5415 8.95837L8.83317 9.66671C8.58317 9.59726 8.33317 9.55212 8.08317 9.53129C7.83317 9.51046 7.58317 9.50004 7.33317 9.50004C6.52761 9.50004 5.73942 9.59726 4.96859 9.79171C4.19775 9.98615 3.45817 10.2639 2.74984 10.625C2.61095 10.6945 2.50678 10.7917 2.43734 10.9167C2.36789 11.0417 2.33317 11.1806 2.33317 11.3334V12H7.33317V13.6667H0.666504ZM7.33317 5.33337C7.7915 5.33337 8.18386 5.17018 8.51025 4.84379C8.83664 4.5174 8.99984 4.12504 8.99984 3.66671C8.99984 3.20837 8.83664 2.81601 8.51025 2.48962C8.18386 2.16324 7.7915 2.00004 7.33317 2.00004C6.87484 2.00004 6.48248 2.16324 6.15609 2.48962C5.8297 2.81601 5.6665 3.20837 5.6665 3.66671C5.6665 4.12504 5.8297 4.5174 6.15609 4.84379C6.48248 5.17018 6.87484 5.33337 7.33317 5.33337Z" fill="#000" />
              </svg>
            </Button>
            <HoverText>Proposers</HoverText>
            </Container>
          </Link>
          </NavBar>
        </Div3>}
        
        {userRole === 'proposer' && <Div3>
        <Link to={"/main"}>
          <LogoKaizen src="https://cdn.builder.io/api/v1/image/assets/TEMP/3905e52e9c6b961ec6717c80409232f3222eab9fc52b8caf2e55d314ff83b93e?apiKey=76bc4e76ba824cf091e9566ff1ae9339&" alt="KaizenCloud Logo" />
          </Link>
          <NavBar>
          <Link to="/add_proposal" style={{ textDecoration: 'none', marginTop: 57, cursor: 'pointer'}}>
            <Container className='not-selected'>
            <Button
              loading="lazy"
            > <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#7D7D7D"><path d="M723.59-192v-92.41h-92.42v-79.18h92.42V-456h79.17v92.41h92.41v79.18h-92.41V-192h-79.17Zm-552 56.13q-33.79 0-58.39-24.61-24.61-24.61-24.61-58.39v-522.26q0-34.48 24.61-58.74 24.6-24.26 58.39-24.26h522.02q34.48 0 58.74 24.26 24.26 24.26 24.26 58.74v216.72h-83v-92.89H171.59v398.43h486v83h-486Zm0-553.43h522.02v-51.83H171.59v51.83Zm0 0v-51.83 51.83Z"/></svg>
            </Button>
            <HoverText>Add Proposal</HoverText>
            </Container>
          </Link>
          <Link to={`/profile/${userData.proposer.id}`} style={{textDecoration: 'none', color: '#333'}}> 
            <Container className='selected'>
            <Button className='selected'
              loading="lazy"
            >
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#7D7D7D"><path d="M480-484.07q-63.59 0-107.86-44.27-44.27-44.27-44.27-107.86 0-63.58 44.27-107.74 44.27-44.15 107.86-44.15 63.59 0 107.86 44.15 44.27 44.16 44.27 107.74 0 63.59-44.27 107.86-44.27 44.27-107.86 44.27ZM183.87-179.8v-104.61q0-25.23 13.74-47.59 13.74-22.37 37.8-37.35 55.72-32.24 117.96-49.48 62.24-17.24 126.42-17.24 64.64 0 127.1 17.12 62.46 17.12 117.7 49.36 24.06 13.95 37.8 36.75 13.74 22.8 13.74 48.41v104.63H183.87Zm83-83h426.26v-20.42q0-4.94-3.02-8.99-3.03-4.04-7.98-6.29-44.56-27.04-95.85-40.8Q535-353.07 480-353.07q-54.52 0-106.28 13.77-51.76 13.76-95.85 40.8-5 3.89-8 7.43-3 3.53-3 7.85v20.42ZM480.2-567.07q28.6 0 48.77-20.36 20.16-20.37 20.16-48.97 0-28.6-20.37-48.64-20.36-20.05-48.96-20.05t-48.77 20.3q-20.16 20.3-20.16 48.81 0 28.6 20.37 48.76 20.36 20.15 48.96 20.15Zm-.2-69.13Zm0 373.4Z" fill='#363636'/></svg>
            </Button>
            <HoverText>Profile</HoverText>
            </Container>
          </Link>
          <Link to="/assigned" style={{ textDecoration: 'none' }}>
            <Container className='not-selected'>
            <Button
              loading="lazy"
            ><svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.75556 13.3778L13.0222 7.11111L11.7778 5.86667L6.75556 10.8889L4.22222 8.35556L2.97778 9.6L6.75556 13.3778ZM1.77778 17.7778C1.28889 17.7778 0.87037 17.6037 0.522222 17.2556C0.174074 16.9074 0 16.4889 0 16V3.55556C0 3.06667 0.174074 2.64815 0.522222 2.3C0.87037 1.95185 1.28889 1.77778 1.77778 1.77778H5.51111C5.7037 1.24444 6.02593 0.814815 6.47778 0.488889C6.92963 0.162963 7.43704 0 8 0C8.56296 0 9.07037 0.162963 9.52222 0.488889C9.97407 0.814815 10.2963 1.24444 10.4889 1.77778H14.2222C14.7111 1.77778 15.1296 1.95185 15.4778 2.3C15.8259 2.64815 16 3.06667 16 3.55556V16C16 16.4889 15.8259 16.9074 15.4778 17.2556C15.1296 17.6037 14.7111 17.7778 14.2222 17.7778H1.77778ZM1.77778 16H14.2222V3.55556H1.77778V16ZM8 2.88889C8.19259 2.88889 8.35185 2.82593 8.47778 2.7C8.6037 2.57407 8.66667 2.41481 8.66667 2.22222C8.66667 2.02963 8.6037 1.87037 8.47778 1.74444C8.35185 1.61852 8.19259 1.55556 8 1.55556C7.80741 1.55556 7.64815 1.61852 7.52222 1.74444C7.3963 1.87037 7.33333 2.02963 7.33333 2.22222C7.33333 2.41481 7.3963 2.57407 7.52222 2.7C7.64815 2.82593 7.80741 2.88889 8 2.88889Z" fill="#7D7D7D" />
              </svg>
            </Button>
            <HoverText>Assigned</HoverText>
            </Container>
          </Link>
          
          <Link to="/proposals" style={{ textDecoration: 'none' }}>
            <Container className='not-selected'>
            <Button
              loading="lazy"
            ><svg width="17" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.66667 16.394C1.20833 16.394 0.815972 16.2367 0.489583 15.9222C0.163194 15.6077 0 15.2296 0 14.7879V3.5455C0 3.10383 0.163194 2.72574 0.489583 2.41121C0.815972 2.09669 1.20833 1.93943 1.66667 1.93943H5.16667C5.34722 1.45762 5.64931 1.06949 6.07292 0.775041C6.49653 0.480596 6.97222 0.333374 7.5 0.333374C8.02778 0.333374 8.50347 0.480596 8.92708 0.775041C9.35069 1.06949 9.65278 1.45762 9.83333 1.93943H13.3333C13.7917 1.93943 14.184 2.09669 14.5104 2.41121C14.8368 2.72574 15 3.10383 15 3.5455V8.9258C14.7361 8.80534 14.4653 8.70162 14.1875 8.61462C13.9097 8.52763 13.625 8.46406 13.3333 8.4239V3.5455H1.66667V14.7879H6.70833C6.75 15.0824 6.81597 15.3634 6.90625 15.6311C6.99653 15.8988 7.10417 16.1531 7.22917 16.394H1.66667ZM1.66667 13.9849V14.7879V3.5455V8.4239V8.36368V13.9849ZM3.33333 13.1819H6.72917C6.77083 12.9008 6.83681 12.6264 6.92708 12.3588C7.01736 12.0911 7.11806 11.8301 7.22917 11.5758H3.33333V13.1819ZM3.33333 9.96974H8.41667C8.86111 9.56822 9.35764 9.23363 9.90625 8.96595C10.4549 8.69827 11.0417 8.51759 11.6667 8.4239V8.36368H3.33333V9.96974ZM3.33333 6.75762H11.6667V5.15156H3.33333V6.75762ZM7.5 2.94322C7.68055 2.94322 7.82986 2.88634 7.94792 2.77258C8.06597 2.65882 8.125 2.51494 8.125 2.34095C8.125 2.16696 8.06597 2.02308 7.94792 1.90932C7.82986 1.79556 7.68055 1.73868 7.5 1.73868C7.31944 1.73868 7.17014 1.79556 7.05208 1.90932C6.93403 2.02308 6.875 2.16696 6.875 2.34095C6.875 2.51494 6.93403 2.65882 7.05208 2.77258C7.17014 2.88634 7.31944 2.94322 7.5 2.94322ZM12.5 18C11.3472 18 10.3646 17.6086 9.55208 16.8256C8.73958 16.0427 8.33333 15.0957 8.33333 13.9849C8.33333 12.874 8.73958 11.9271 9.55208 11.1442C10.3646 10.3612 11.3472 9.96974 12.5 9.96974C13.6528 9.96974 14.6354 10.3612 15.4479 11.1442C16.2604 11.9271 16.6667 12.874 16.6667 13.9849C16.6667 15.0957 16.2604 16.0427 15.4479 16.8256C14.6354 17.6086 13.6528 18 12.5 18ZM12.0833 16.394H12.9167V14.3864H15V13.5834H12.9167V11.5758H12.0833V13.5834H10V14.3864H12.0833V16.394Z" fill="#7D7D7D" />
              </svg>
            </Button>
            <HoverText>Proposals</HoverText>
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

          <Link to="/settings/profile" style={{ textDecoration: 'none' }}>
            <Container className='not-selected'>
            <Button className='not-selected'
              loading="lazy"
            ><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z" fill="#7D7D7D"/></svg>
            </Button>
            <HoverText className='not-selected'>Settings</HoverText>
            </Container>
          </Link>
          </NavBar>
        </Div3>}

        <ProfileWrapper>
          <Div5>
            <Div6>Company name</Div6>
            <EditAndDropdown>
              {isOwner && (
                <Link to='/settings/profile'>
                <EditButton>
                <svg width="32" height="28" viewBox="0 0 32 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.8967 13.1938C11.1234 13.1938 9.60537 12.5624 8.34257 11.2996C7.07976 10.0368 6.44836 8.51878 6.44836 6.74548C6.44836 4.97218 7.07976 3.45413 8.34257 2.19133C9.60537 0.928521 11.1234 0.297119 12.8967 0.297119C14.67 0.297119 16.1881 0.928521 17.4509 2.19133C18.7137 3.45413 19.3451 4.97218 19.3451 6.74548C19.3451 8.51878 18.7137 10.0368 17.4509 11.2996C16.1881 12.5624 14.67 13.1938 12.8967 13.1938ZM0 26.0906V21.5767C0 20.6901 0.22838 19.8572 0.685139 19.078C1.1419 18.2988 1.7733 17.7077 2.57934 17.3047C3.94962 16.6061 5.49454 16.015 7.21411 15.5314C8.93367 15.0477 10.8279 14.8059 12.8967 14.8059H13.461C13.6222 14.8059 13.7834 14.8328 13.9446 14.8865C13.7296 15.3702 13.5483 15.8739 13.4005 16.3979C13.2527 16.9218 13.1385 17.4659 13.0579 18.0301H12.8967C10.9891 18.0301 9.27624 18.2719 7.75819 18.7556C6.24013 19.2392 4.99748 19.7228 4.03023 20.2064C3.78841 20.3408 3.59362 20.5289 3.44584 20.7707C3.29807 21.0125 3.22418 21.2812 3.22418 21.5767V22.8664H13.3804C13.5416 23.4306 13.7565 23.9881 14.0252 24.5389C14.2939 25.0897 14.5894 25.6069 14.9118 26.0906H0ZM22.5693 27.7027L22.0856 25.2845C21.7632 25.1502 21.461 25.0091 21.1788 24.8614C20.8967 24.7136 20.6079 24.5322 20.3123 24.3173L17.9748 25.0427L16.3627 22.3022L18.2166 20.6901C18.1629 20.3139 18.136 19.9646 18.136 19.6422C18.136 19.3198 18.1629 18.9705 18.2166 18.5943L16.3627 16.9823L17.9748 14.2417L20.3123 14.9671C20.6079 14.7522 20.8967 14.5708 21.1788 14.4231C21.461 14.2753 21.7632 14.1342 22.0856 13.9999L22.5693 11.5818H25.7934L26.2771 13.9999C26.5995 14.1342 26.9018 14.282 27.1839 14.4432C27.466 14.6044 27.7548 14.8059 28.0504 15.0477L30.3879 14.2417L32 17.0629L30.1461 18.675C30.1998 18.9974 30.2267 19.3332 30.2267 19.6825C30.2267 20.0318 30.1998 20.3676 30.1461 20.6901L32 22.3022L30.3879 25.0427L28.0504 24.3173C27.7548 24.5322 27.466 24.7136 27.1839 24.8614C26.9018 25.0091 26.5995 25.1502 26.2771 25.2845L25.7934 27.7027H22.5693ZM24.1814 22.8664C25.068 22.8664 25.827 22.5507 26.4584 21.9193C27.0898 21.2879 27.4055 20.5289 27.4055 19.6422C27.4055 18.7556 27.0898 17.9965 26.4584 17.3651C25.827 16.7337 25.068 16.418 24.1814 16.418C23.2947 16.418 22.5357 16.7337 21.9043 17.3651C21.2729 17.9965 20.9572 18.7556 20.9572 19.6422C20.9572 20.5289 21.2729 21.2879 21.9043 21.9193C22.5357 22.5507 23.2947 22.8664 24.1814 22.8664ZM12.8967 9.96966C13.7834 9.96966 14.5424 9.65396 15.1738 9.02256C15.8052 8.39116 16.1209 7.63213 16.1209 6.74548C16.1209 5.85883 15.8052 5.09981 15.1738 4.4684C14.5424 3.837 13.7834 3.5213 12.8967 3.5213C12.0101 3.5213 11.251 3.837 10.6196 4.4684C9.98825 5.09981 9.67254 5.85883 9.67254 6.74548C9.67254 7.63213 9.98825 8.39116 10.6196 9.02256C11.251 9.65396 12.0101 9.96966 12.8967 9.96966Z" fill="#939393"/>
                </svg>
                </EditButton>
                </Link>
              )}
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
            </EditAndDropdown>
               
          </Div5>
          <ProfileContent>

            <ProfileColumn>

              <ProfileInfo>
                <ProposerProfile>
                  <ProposerTitle>{profileData.user.first_name}'s profile</ProposerTitle>
                  <ProposerImage  src={imageSrc || Logo } alt="Proposer" />
                  <ProposerName>{profileData.user.last_name} {profileData.user.first_name}</ProposerName>
                </ProposerProfile>
                <Divider />
                <ProposerStats>
                  <StatWrapper>
                  <StatIcons>
                    <StatIcon src="https://cdn.builder.io/api/v1/image/assets/TEMP/48f02eb6f2e80808819e0fff01696b38bef5f88910e8b2bccfd10f5ab061d718?apiKey=76bc4e76ba824cf091e9566ff1ae9339&" alt="Stat 1" />
                    <StatIcon src="https://cdn.builder.io/api/v1/image/assets/TEMP/f5d6927b0edbfdd58a5aee8b073eb73f97b0b77500c82cba1f16c962ba60a808?apiKey=76bc4e76ba824cf091e9566ff1ae9339&" alt="Stat 2" />
                    <StatIcon src="https://cdn.builder.io/api/v1/image/assets/TEMP/b0c1ca8636cd7411382d0f5e42d8c0ee10d3036aded511b137f01153e5b08d8f?apiKey=76bc4e76ba824cf091e9566ff1ae9339&" alt="Stat 3" />
                    <StatIcon src="https://cdn.builder.io/api/v1/image/assets/TEMP/e612e4df7331a1a77a9321ec00348235972053f7f1d63da36fc207c8b095475d?apiKey=76bc4e76ba824cf091e9566ff1ae9339&" alt="Stat 4" />
                  </StatIcons>
                  <StatValues>
                    <StatValue>{sumNew}</StatValue>
                    <StatValue>{sumAccepted}</StatValue>
                    <StatValue>{sumDeclined}</StatValue>
                    <StatValue>{sumArchived}</StatValue>
                  </StatValues>
                  </StatWrapper>
                  <AwardsSection>
                    <VerticalDivider />
                    <AwardsTitle>Awards</AwardsTitle>
                  </AwardsSection>
                  <AwardsIcons>
                    {data[0].awards.map((award) => (
                      <AwardIcon key={award.id} src={award.image} alt={`Award ${award.id}`} />
                    ))}
                  </AwardsIcons>
                </ProposerStats>
              </ProfileInfo>
            </ProfileColumn>
            <MainVerticalDivider />
            <GraphColumn>
          
              <LastProposalsGraph>
                <GraphTitle>
               
                  <VerticalDivider />
                  
                  <GraphTitleText>Last proposals graph</GraphTitleText>
                  <Select options={years} onChange={handleYearChange} value={{ value: selectedYear, label: selectedYear }} />
                </GraphTitle>
                <GraphContent>
                </GraphContent>
                <ContributionCalendar 
        start={`${selectedYear}-01-01`}
        end={`${selectedYear}-12-31`}
        daysOfTheWeek={["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]}
        includeBoundary={true}
        startsOnSunday={true}
        theme={customTheme}
        cx={12}
        data={calendarData}
        cy={12}
        onCellClick={(_, data) => console.log(data)}
        scroll={false}
      />
              </LastProposalsGraph>
              <Divider style={{marginTop: 65}} />
              <LastProposalsJournal>
                <JournalTitle>
                  <VerticalDivider />
                  <JournalTitleText>Last proposals journal</JournalTitleText>
                </JournalTitle>
                <JournalContent>
                  <JournalText>
                  <JournalDescription>
  {lastCreatedProposal && lastCreatedProposal.text}
</JournalDescription>
<JournalDate>
  {lastCreatedProposal && formatDate(lastCreatedProposal.created_at)}
</JournalDate>
                  </JournalText>
                  <JournalIcon>
                    <JournalIconImage src="https://cdn.builder.io/api/v1/image/assets/TEMP/59ec102d7837fee5a2a5c1e6f1168c560a21aaa8d15f67d9d81cdc7e11cc3173?apiKey=76bc4e76ba824cf091e9566ff1ae9339&" alt="Journal Icon" />
                    <JournalIconBackground />
                  </JournalIcon>
                </JournalContent>
              </LastProposalsJournal>
            </GraphColumn>
          </ProfileContent>
        </ProfileWrapper>

      </Main>
    </Container>
  );
}

const HeaderWrapper = styled.header`
  display: flex;
  width: 100%;
  gap: 20px;
  font-size: 16px;
  font-weight: 400;
  justify-content: space-between;
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

const JournalText = styled.div`
  width: 90%;

`;
const JournalDescription = styled.div`
overflow-x: hidden;
overflow-y: auto;
max-height: 75px;
`;

const JournalDate = styled.div`
display: flex;
margin-top: 5%;
margin-left: 70%;
`;

const JournalIcon = styled.div`
`;

const JournalIconImage = styled.div`
`;

const JournalIconBackground = styled.div`
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
const EditAndDropdown = styled.div`
  display: flex;
`;
const EditButton = styled.div`
  cursor: pointer;
  margin-right: 16px; 
  display: flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: 8px;
  border: 1px solid #d7d7d7;
  background-color: #fff;
`;
const DropdownWrapper = styled.div`
  width: 160px;
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
  cursro: pointer;
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


const LogoKaizen = styled.img`
  aspect-ratio: 1.12;
  object-fit: contain;
  object-position: center;
  width: 43px;
`;

const Main = styled.div`
  display: flex;
  width: 100%;
  gap: 20px;
  font-size: 16px;
  font-weight: 400;
  background-color: #f2f2f2;
  @media (max-width: 991px) {
    max-width: 100%;
    flex-wrap: wrap;
  }
`;

const ProfileWrapper = styled.div`
  margin-left: 60px;
  border-radius: 6px;
  width: 95%;
  margin-top: 5px;

  @media (max-width: 991px) {
    max-width: 100%;
    padding-right: 20px;
  }
`;

const ProfileContent = styled.div`
margin-top: 20px;

border-radius: 10px;
background-color: #fff;
  display: flex;
  gap: 20px;
  @media (max-width: 991px) {
    flex-direction: column;
    align-items: stretch;
    gap: 0;
  }
`;

const ProfileColumn = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  line-height: normal;
  margin-left: 0;

  @media (max-width: 991px) {
    width: 100%;
  }
`;

const ProfileInfo = styled.div`
  flex-grow: 1;
  justify-content: center;

  @media (max-width: 991px) {
    max-width: 100%;
    margin-top: 40px;
    flex-wrap: wrap;
  }
`;

const ProposerProfile = styled.div`
  display: flex;
  margin-top: 25px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  flex-basis: 0;
  
  width: 400px;
 
  @media (max-width: 991px) {
    max-width: 100%;
  }
`;

const ProposerTitle = styled.h2`
  color: #1871ed;
  font-family: Roboto, sans-serif;
  justify-content: center;
  font-size: 25px;
  font-weight: 700;
`;

const ProposerImage = styled.img`
  aspect-ratio: 1.02;
  border-radius: 50%;
  object-fit: cover;
  width: 130px;
  height: 130px;
  margin-top: 23px;
`;

const ProposerName = styled.p`
  color: #6e6e6e;
  font-family: Roboto, sans-serif;
  font-size: 25px;
  font-weight: 500;
  margin-top: 20px;
  @media (max-width: 991px) {
    margin-left: 10px;
  }
`;

const Divider = styled.div`
  border-color: rgba(211, 211, 211, 1);
  border-style: solid;
  border-width: 1px;
  background-color: #d3d3d3;
  align-self: stretch;
  margin-top: 35px;

  height: 1px;

  @media (max-width: 991px) {
    max-width: 100%;
  }
`;

const ProposerStats = styled.div`
  display: flex;
  width: 230px;
  width: 100%;
  align-self: 200px;
  justify-content: center;
  flex-direction: column;

  @media (max-width: 991px) {
    margin-left: 10px;
  }
`;

const StatWrapper = styled.div`
  display: flex;
  width: 250px;
  margin-top: 25px;
  align-self: center;
  justify-content: center;
  flex-direction: column;

  @media (max-width: 991px) {
    margin-left: 10px;
  }
`;

const StatIcons = styled.div`
  display: flex;
  gap: 20px;
  justify-content: space-between;
`;

const StatIcon = styled.img`
  aspect-ratio: 1;
  object-fit: contain;
  width: 30px;
`;

const StatValues = styled.div`
  display: flex;
  margin-top: 32px;
  font-size: 20px;
  color: #8e8e8e;
  font-weight: 500;
  white-space: nowrap;
  justify-content: space-between;

  @media (max-width: 991px) {
    white-space: initial;
  }
`;

const StatValue = styled.span`
  display: flex;
  justify-content: center;
  width: 30px;
  font-family: Roboto, sans-serif;
`;

const AwardsSection = styled.div`
  margin-left: 15px;
  display: flex;
  margin-top: 39px;
  gap: 10px;
  font-size: 19px;
  color: #8e8e8e;
  font-weight: 500;
  white-space: nowrap;

  @media (max-width: 991px) {
    white-space: initial;
  }
`;

const VerticalDivider = styled.div`
  border-color: rgba(132, 167, 217, 1);
  border-style: solid;
  border-width: 1px;
  background-color: #84a7d9;
  width: 1px;
  height: 28px;
`;

const MainVerticalDivider = styled.div`
  border: 1px solid rgba(211, 211, 211, 1);
  background-color: #d3d3d3;
  width: 1px;
`;

const AwardsTitle = styled.h3`
  font-family: Roboto, sans-serif;
  flex-grow: 1;
  flex-basis: auto;
  margin: auto 0;
`;

const AwardsIcons = styled.div`
  margin-left: 15px;
  display: flex;
  margin-top: 45px;
  gap: 20px;

  @media (max-width: 991px) {
    padding-right: 20px;
    margin-top: 40px;
  }
`;

const AwardIcon = styled.img`
  aspect-ratio: 1;
  object-fit: contain;
  width: 50px;
  align-self: start;
`;

const GraphColumn = styled.div`
  display: flex;
  flex-direction: column;
  line-height: normal;
  width: 62%;
  margin-left: 20px;

  @media (max-width: 991px) {
    width: 100%;
  }
`;

const LastProposalsGraph = styled.section`
  display: flex;
  flex-direction: column;
  align-self: stretch;
  margin-top: 85px;
  width: 75%;
  @media (max-width: 991px) {
    max-width: 100%;
    margin-top: 40px;
  }
`;



const GraphTitle = styled.div`
  align-self: start;
  display: flex;
  gap: 10px;
  font-size: 15px;
  color: #8e8e8e;
  font-weight: 500;
`;

const GraphTitleText = styled.h2`
  font-family: Roboto, sans-serif;
  flex-grow: 1;
  flex-basis: auto;
  margin: auto 0;
`;



const GraphContent = styled.div`
  display: flex;
  margin-top: 43px;

  @media (max-width: 991px) {
    max-width: 100%;
    flex-wrap: wrap;
    white-space: initial;
  }
`;


const GraphLegend = styled.div`
  align-self: end;
  display: flex;
  margin-top: 64px;
  gap: 12px;
  font-size: 14px;
  color: #a7a7a7;
  font-weight: 300;
  white-space: nowrap;

  @media (max-width: 991px) {
    margin-top: 40px;
    white-space: initial;
  }
`;

const LegendLabel = styled.span`
  font-family: Roboto, sans-serif;
  flex-grow: 1;
`;

const LegendColors = styled.div`
  display: flex;
  gap: 6px;

  @media (max-width: 991px) {
    white-space: initial;
  }
`;

const LegendColor = styled.div`
  background-color: ${(props) => props.color};
  width: 10px;
  height: 10px;
`;

const LastProposalsJournal = styled.section`
  display: flex;
  flex-direction: column;
`;

const JournalTitle = styled.div`
  align-self: start;
  display: flex;
  margin-top: 36px;
  gap: 10px;
  font-size: 15px;
  color: #8e8e8e;
  font-weight: 500;
`;

const JournalTitleText = styled.h2`
  font-family: Roboto, sans-serif;
  flex-grow: 1;
  flex-basis: auto;
  margin: auto 0;
`;

const JournalContent = styled.div`
  background-color: #e6efff;
  font-weight: bold;
  border-radius: 15px;
  padding: 15px;
  display: flex;
  width: 505px;
  max-width: 100%;
  gap: 20px;
  color: #666666;
  font-size: 13px;
  font-family: Roboto, sans-serif;
  margin: 28px 0 0 23px;
  
  @media (max-width: 991px) {
    flex-wrap: wrap;
  }
`;



export default Header;