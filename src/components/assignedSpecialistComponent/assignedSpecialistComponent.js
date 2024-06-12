import React, { useState, useEffect, useRef} from 'react';
import styled from "styled-components";
import Spinner from '../spinner/spinner';
import { fetchUserData, getGrades, getProposerById, getComments, fetchSpecialistProposalData, fetchProposalData, fetchGradingsData, 
  addComment, updateProposalStatusArchive, fetchProposersData, changeAssignProposal, getImageById } from '../../services/apiService';
import { Link } from 'react-router-dom';
import "react-calendar/dist/Calendar.css";
import Avatar from '../../images/User-512.webp';

import '../CSS/style.css'; 
import toast, { Toaster } from 'react-hot-toast';

export const logOut = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userRole');
    window.location.href = "../login";
};

const PopupNotification = ({ message, onClose }) => {

  const handleRedirect = () => {
    window.location.href = "../main";
    onClose();
  };

  return (
    <Overlay>
      <Popup>
        <Message>{message}</Message>
        <PopupButton onClick={handleRedirect}>OK</PopupButton>
      </Popup>
    </Overlay>
  );
};

function AssignedSpecialist(props) {
  const [imageSrc, setImageSrc] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [profileImageSrc, setProfileImageSrc] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [proposalData, setProposalData] = useState(null);
  const [allProposals, setAllProposals] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [proposersData, setProposersData] = useState(null);
  const [allProposers, setAllProposers] = useState(null);
  const [selectedProposers, setSelectedProposers] = useState(null);
  const [gradingsData, setGradingsData] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [isHovered, setIsHovered] = useState(false);
  const [proposersProposals, setProposersProposals] = useState(null);
  const [proposersProposalsFull, setProposersProposalsFull] = useState(null);
  const [grades, setGrades] = useState(new Map());
  const [query, setQuery] = useState('');
  const [proposerInfo, setProposerInfo] = useState([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef(null);

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

  const headerLabelWidths = [89, 89.5, 97, 88.5, 89.5, 89, 89.5, 89, 89, 95.5, 88.5];

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEmployee, setSelectedEmployee] = useState(-1);
  const [isEmployeeSelected, setIsEmployeeSelected] = useState(false);
  const [isCalendarSelected, setIsCalendarSelected] = useState(false);

  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedOption, setSelectedOption] = useState('Change status');

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  const handleDeclined = () => {
    setSelectedOption('Declined');
    setIsOpen(false);
  };
  const handleDone = () => {
    setSelectedOption('Done');
    setIsOpen(false);
  };

  const handleAssign = async () => {
    if(selectedOption === 'Change status'){
      toast('Status should be changed to assign', {
        duration: 4000,
        position: 'top-center',
      
        style: {},
        className: '',
      
        icon: 'ℹ️',
      
        iconTheme: {
          primary: '#0000FF',
          secondary: '#0000FF',
        },
      
        ariaProps: {
          role: 'status',
          'aria-live': 'polite',
        },
      });
      return;
    }

    try{
    await changeAssignProposal(proposalData[currentIndex].id, selectedOption);
    toast.success("Proposal assigned!");
    setSelectedOption('Change status');
    updateProposalList();
    setSelectedEmployee(-1);
    setSelectedDate(new Date());
    setIsEmployeeSelected(false);
    } catch(error) {
      toast.error("Error");
    }

  };

 

    useEffect(() => {
      function handleClickOutside(event) {
        if (calendarRef.current && !calendarRef.current.contains(event.target)) {
          setShowCalendar(false);
          setIsEmployeeSelected(false);
          setIsCalendarSelected(false);
          setSelectedEmployee(-1);
          setSelectedDate(new Date());
        }
      }
  
      document.addEventListener('mousedown', handleClickOutside);
  
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);
    
    const handleClosePopup = () => {
      setShowPopup(false);
    };

  const fetchData = async () => {
    try {
      const allProposalsResponse = await fetchProposalData();
      const userDataResponse = await fetchUserData();
      const proposalDataResponse = await fetchSpecialistProposalData(userDataResponse.id);
      console.log("Aidishka", userDataResponse.id);
      if(proposalDataResponse.length === 0) {
        setShowPopup(true);
      }
      const gradingsDataResponse = await fetchGradingsData();
      const proposersDataResponse = await fetchProposersData();
      const transformedData = [];
      proposersDataResponse.forEach((item) => {
        transformedData[item.id] = item;
      });
      setSelectedEmployee(transformedData.length-1);
      console.log("asdasd: ", proposersDataResponse);
      console.log("All proposers: ", transformedData);
      setAllProposers(transformedData);
      setSelectedProposers(transformedData);

      if (userDataResponse) {
        if(userDataResponse.avatar){
          const imageResponse = await getImageById(userDataResponse.avatar);
          setImageSrc(imageResponse.image);
        }
        setUserData(userDataResponse);
      } 
      setAllProposals(allProposalsResponse);
      setProposalData(proposalDataResponse);
      setGradingsData(gradingsDataResponse);
      
      if (proposalDataResponse.length > 0) {
        const proposer = await getProposerById(proposalDataResponse[0].proposer);
        const comments = await getComments(proposalDataResponse[0].id); 
        const filteredArray = proposalDataResponse.filter(item => item.proposer === proposalDataResponse[0].proposer);
        
        setProposersProposals(filteredArray);
        setProposersProposalsFull(filteredArray);
        setProposersData(proposer);
        if(proposer.user.avatar) {
          const imageResponse = await getImageById(proposer.user.avatar);
          setProfileImageSrc(imageResponse);
        }
        setComments(comments);

        filteredArray.forEach(async (item) =>  {
          if(!grades.has(item.id)){
            const gradesDataResponse = await getGrades(item.id);
            setGrades(grades.set(item.id, gradesDataResponse[0].gradings));  
          }
        });
        const filteredProposersProposals = allProposalsResponse.filter(item => item.proposer === proposalDataResponse[0].proposer);
        const acceptedProposals = filteredProposersProposals.filter(item => item.status === 'Accepted');
        const declinedProposals = filteredProposersProposals.filter(item => item.status === 'Declined');
        setProposerInfo([{
          title: "Total sent",
          value: filteredProposersProposals.length,
          description: "During all this time",
        },
        {
          title: "Accepted",
          value: acceptedProposals.length,
          description: "During all this time",
        },
        {
          title: "Rejected",
          value: declinedProposals.length,
          description: "During all this time",
        },]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };
  

  const handleAddComment = async () => {
    try {
      await addComment(proposalData[currentIndex].id, commentText);
      const comments = await getComments(proposalData[currentIndex].id);
      setComments(comments);
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

  const updateProposalList = async () => {
    try {
      const updatedProposalData = await fetchSpecialistProposalData(userData.id);
      setProposalData(updatedProposalData);
    } catch (error) {
      console.error('Error updating proposal list:', error);
    }
  };

  const archive = async (id) => {
    await updateProposalStatusArchive(proposalData[currentIndex].id, "Archived");
    updateProposalList();
  }

  const fetchProposerData = async (id) => {
    try {
      if (id) {
        const proposer = await getProposerById(id);
        if(proposer.user.avatar) {
          const imageResponse = await getImageById(proposer.user.avatar);
          setProfileImageSrc(imageResponse.image);
        }
        else {
          setProfileImageSrc(null);
        }
        setProposersData(proposer);
      }
    } catch (error) {
      console.error('Error fetching proposer data:', error);
    }
  };

  const fetchCommentsData = async (id) => {
    try {
      if (id) {
        const comments = await getComments(id); 

        setComments(comments);
      }
    } catch (error) {
      console.error('Error fetching comments data:', error);
    }
  };

  const handleNext = async () => {
    const nextProposal = proposalData.find((data, index) => index > currentIndex);
    if (nextProposal) {
      if(nextProposal.proposer != proposersData.id){
          console.log("BOOOM");
          const filteredProposersProposals = allProposals.filter(item => item.proposer === nextProposal.proposer);
          const acceptedProposals = filteredProposersProposals.filter(item => item.status === 'Accepted');
          const declinedProposals = filteredProposersProposals.filter(item => item.status === 'Declined');
          setProposerInfo([{
            title: "Total sent",
            value: filteredProposersProposals.length,
            description: "During all this time",
          },
          {
            title: "Accepted",
            value: acceptedProposals.length,
            description: "During all this time",
          },
          {
            title: "Rejected",
            value: declinedProposals.length,
            description: "During all this time",
          },]);
          const filteredArray = proposalData.filter(item => item.proposer === nextProposal.proposer);
          setProposersProposals(filteredArray);
          setProposersProposalsFull(filteredArray);
          filteredArray.forEach(async (item) =>  {
            if(!grades.has(item.id)){
              const gradesDataResponse = await getGrades(item.id);
              setGrades(grades.set(item.id, gradesDataResponse[0].gradings));  
            }
          });
        }
      }
      setCurrentIndex(proposalData.indexOf(nextProposal));
      fetchProposerData(nextProposal.proposer);
      fetchCommentsData(nextProposal.id);
  };

  const handleBack = () => {
    const prevProposal = (currentIndex-1 >= 0) ? proposalData[currentIndex-1] : null;
    if (prevProposal) {
      if(prevProposal.proposer != proposersData.proposer){
          const filteredProposersProposals = allProposals.filter(item => item.proposer === prevProposal.proposer);
          const acceptedProposals = filteredProposersProposals.filter(item => item.status === 'Accepted');
          const declinedProposals = filteredProposersProposals.filter(item => item.status === 'Declined');
          setProposerInfo([{
            title: "Total sent",
            value: filteredProposersProposals.length,
            description: "During all this time",
          },
          {
            title: "Accepted",
            value: acceptedProposals.length,
            description: "During all this time",
          },
          {
            title: "Rejected",
            value: declinedProposals.length,
            description: "During all this time",
          },]);
        const filteredArray = proposalData.filter(item => item.proposer === prevProposal.proposer);
        setProposersProposals(filteredArray);
        setProposersProposalsFull(filteredArray);

        filteredArray.forEach(async (item) =>  {
          if(!grades.has(item.id)){
            const gradesDataResponse = await getGrades(item.id);
            setGrades(grades.set(item.id, gradesDataResponse[0].gradings));  
          }
        });
      }
      setCurrentIndex(proposalData.indexOf(prevProposal));
      fetchProposerData(prevProposal.proposer);
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
    {showPopup && (
        <PopupNotification 
          message="You don't have any assigned proposals." 
          onClose={handleClosePopup} 
        />
      )}
    <Div>
      <Div2>
      <Div3>
        <Link to={"/main"}>
          <LogoKaizen src="https://cdn.builder.io/api/v1/image/assets/TEMP/3905e52e9c6b961ec6717c80409232f3222eab9fc52b8caf2e55d314ff83b93e?apiKey=76bc4e76ba824cf091e9566ff1ae9339&" alt="KaizenCloud Logo" />
          </Link>
          <NavBar>
          <Link to="/add_proposal" style={{ textDecoration: 'none', marginTop: 57, cursor: 'pointer'}}>
            <Container className='not-selected'>
            <Button className='not-selected'
              loading="lazy"
            > <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#7D7D7D"><path d="M723.59-192v-92.41h-92.42v-79.18h92.42V-456h79.17v92.41h92.41v79.18h-92.41V-192h-79.17Zm-552 56.13q-33.79 0-58.39-24.61-24.61-24.61-24.61-58.39v-522.26q0-34.48 24.61-58.74 24.6-24.26 58.39-24.26h522.02q34.48 0 58.74 24.26 24.26 24.26 24.26 58.74v216.72h-83v-92.89H171.59v398.43h486v83h-486Zm0-553.43h522.02v-51.83H171.59v51.83Zm0 0v-51.83 51.83Z" fill="#7D7D7D"/></svg>
            </Button>
            <HoverText>Add Proposal</HoverText>
            </Container>
          </Link>
          <Link to={`/profile/${userData.proposer.id}`} style={{textDecoration: 'none', color: '#333'}}> 
            <Container className='not-selected'>
            <Button
              loading="lazy"
            >
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#7D7D7D"><path d="M480-484.07q-63.59 0-107.86-44.27-44.27-44.27-44.27-107.86 0-63.58 44.27-107.74 44.27-44.15 107.86-44.15 63.59 0 107.86 44.15 44.27 44.16 44.27 107.74 0 63.59-44.27 107.86-44.27 44.27-107.86 44.27ZM183.87-179.8v-104.61q0-25.23 13.74-47.59 13.74-22.37 37.8-37.35 55.72-32.24 117.96-49.48 62.24-17.24 126.42-17.24 64.64 0 127.1 17.12 62.46 17.12 117.7 49.36 24.06 13.95 37.8 36.75 13.74 22.8 13.74 48.41v104.63H183.87Zm83-83h426.26v-20.42q0-4.94-3.02-8.99-3.03-4.04-7.98-6.29-44.56-27.04-95.85-40.8Q535-353.07 480-353.07q-54.52 0-106.28 13.77-51.76 13.76-95.85 40.8-5 3.89-8 7.43-3 3.53-3 7.85v20.42ZM480.2-567.07q28.6 0 48.77-20.36 20.16-20.37 20.16-48.97 0-28.6-20.37-48.64-20.36-20.05-48.96-20.05t-48.77 20.3q-20.16 20.3-20.16 48.81 0 28.6 20.37 48.76 20.36 20.15 48.96 20.15Zm-.2-69.13Zm0 373.4Z"/></svg>
            </Button>
            <HoverText>Profile</HoverText>
            </Container>
          </Link>
          <Link to="/assigned" style={{ textDecoration: 'none' }}>
            <Container className='selected'>
            <Button className='selected'
              loading="lazy"
            ><svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.75556 13.3778L13.0222 7.11111L11.7778 5.86667L6.75556 10.8889L4.22222 8.35556L2.97778 9.6L6.75556 13.3778ZM1.77778 17.7778C1.28889 17.7778 0.87037 17.6037 0.522222 17.2556C0.174074 16.9074 0 16.4889 0 16V3.55556C0 3.06667 0.174074 2.64815 0.522222 2.3C0.87037 1.95185 1.28889 1.77778 1.77778 1.77778H5.51111C5.7037 1.24444 6.02593 0.814815 6.47778 0.488889C6.92963 0.162963 7.43704 0 8 0C8.56296 0 9.07037 0.162963 9.52222 0.488889C9.97407 0.814815 10.2963 1.24444 10.4889 1.77778H14.2222C14.7111 1.77778 15.1296 1.95185 15.4778 2.3C15.8259 2.64815 16 3.06667 16 3.55556V16C16 16.4889 15.8259 16.9074 15.4778 17.2556C15.1296 17.6037 14.7111 17.7778 14.2222 17.7778H1.77778ZM1.77778 16H14.2222V3.55556H1.77778V16ZM8 2.88889C8.19259 2.88889 8.35185 2.82593 8.47778 2.7C8.6037 2.57407 8.66667 2.41481 8.66667 2.22222C8.66667 2.02963 8.6037 1.87037 8.47778 1.74444C8.35185 1.61852 8.19259 1.55556 8 1.55556C7.80741 1.55556 7.64815 1.61852 7.52222 1.74444C7.3963 1.87037 7.33333 2.02963 7.33333 2.22222C7.33333 2.41481 7.3963 2.57407 7.52222 2.7C7.64815 2.82593 7.80741 2.88889 8 2.88889Z" fill='#363636' />
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
                <Column>
                  {proposalData.map((data, index) => (
                    <Div12
                      className={`slide ${index === currentIndex ? 'active' : ''} ${index < currentIndex ? 'slideToLeft' : index > currentIndex ? 'slideToRight' : ''}`}
                      key={data.id}
                    >
                      <Div13>
                        <Div14>{formatDate(data.created_at)}</Div14>
                        <Div15>
                        <StatusChangeWrapper>
                        <StatusButton status={selectedOption} onClick={toggleDropdown}>
                            <StatusText>{selectedOption}</StatusText>
                            <DropDownIcon>
                            <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="#5f6368"><path d="M480-360 280-560h400L480-360Z"/></svg>
                            </DropDownIcon>
                          </StatusButton>
                          {isOpen && (
                            <StatusDropdown>
                            {selectedOption !== 'Declined' && (
                            <DeclineButton onClick={handleDeclined}>Declined</DeclineButton>
                            )}
                            {selectedOption !== 'Done' && (
                            <DoneButton onClick={handleDone}>Done</DoneButton>
                            )}
                            </StatusDropdown>
                          )}
                        </StatusChangeWrapper>
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
                          <AssignButton onClick={handleAssign}>Assign</AssignButton>
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
                  <ContainerTwo>
                  <ProfileCardWrapper>
                  <ProfileHeader>
                    <ProfileImage src={profileImageSrc || Avatar} alt="Profile" loading="lazy" />
                    <ProfileInfo>
                    <Link to={`/profile/${proposersData.id}`} style={{textDecoration: 'none', color: '#333'}}> 
                    <ProfileName>{proposersData.user.last_name} {proposersData.user.first_name}</ProfileName>
                    </Link>
                    </ProfileInfo>
                  </ProfileHeader>
                  <OffersSummary>
                    <OffersTitle>Offers</OffersTitle>
                    <TotalOffersTitle>Total offers</TotalOffersTitle>
                  </OffersSummary>
                  <Divider />
                  {proposerInfo.map((item, index) => (
                    <React.Fragment key={index}>
                      <OfferItem>
                        <OfferTitle>{item.title}</OfferTitle>
                        <OfferDetails>
                          <OfferValue>{item.value}</OfferValue>
                          <OfferDescription>{item.description}</OfferDescription>
                        </OfferDetails>
                      </OfferItem>
                      {index !== proposerInfo.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </ProfileCardWrapper>
                </ContainerTwo>
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

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Popup = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
`;

const Message = styled.p`
  font-size: 16px;
  margin-bottom: 20px;
`;

const PopupButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #0056b3;
  }
`;

const AssignButton = styled.button`
  display: inline-block;
  width: 150px;
  align-self: end;
  padding: 10px;
  border-radius: 6px;
  background-color: #1877f2;
  color: #fff;
  font: 500 14px Roboto, sans-serif;
  white-space: nowrap;
  border: none;
  cursor: pointer;
`;
const StatusChangeWrapper = styled.div`
  position: relative;
`;

const StatusButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 135px;
  padding: 12px 20px;
  border: none;
  border-radius: 8px 4px 4px 8px;
  background-color: #e6e6e6;
  color: ${({ status }) => {
    switch (status) {
      case 'Declined':
        return '#c90000';
      case 'Done':
        return '#66b237';
      default:
        return '#5d5d5d';
    }
  }};
  cursor: pointer;
`;

const StatusText = styled.div`
  font-family: Roboto, sans-serif;
`;

const DropDownIcon = styled.div`
  margin-left: 5px;
`;

const StatusDropdown = styled.div`
  position: absolute;
  top: 100%;
  text-align:center;
  left: 0;
  width: 100%;
  margin-top: 4px;
  background-color: #e6e6e6;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1;
`;
const DeclineButton = styled.div`
  padding: 12px 20px;
  font-family: Roboto, sans-serif;
  color: #c90000;
  cursor: pointer;

  &:hover {
    background-color: #ebebeb;
  }
`;
const DoneButton = styled.div`
  padding: 13px 39px;
  font-family: Roboto, sans-serif;
  color: #66b237;
  cursor: pointer;

  &:hover {
    background-color: #edf5ff;
  }
`;

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
  z-index: 110;
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
  z-index: 11;
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
  margin-top: 70px;
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
const ChangeStatusButton = styled.button`
  border:none;
  cursor:pointer;
  font-family: Roboto, sans-serif;
  border-radius: 8px 4px 4px 8px;
  background-color: #e6e6e6;
  flex-grow: 1;
  justify-content: center;
  padding: 13px 10px;
  
  @media (max-width: 991px) {
    white-space: initial;
    padding: 0 20px;
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
  height: 150px;
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
  z-index: 100;
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
const ProfileCardWrapper = styled.section`
  border-radius: 8px;
  box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.2);
  background-color: #fff;
  display: flex;
  max-width: 596px;
  flex-direction: column;
  align-items: start;
  padding: 17px;
  @media (max-width: 991px) {
    padding-right: 20px;
  }
`;

const ProfileHeader = styled.header`
  display: flex;
  gap: 18px;
  color: #525252;
`;

const ProfileImage = styled.img`
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 50%;
`;

const ProfileInfo = styled.div`
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const ProfileName = styled.h2`
  font: 500 18px Roboto, sans-serif;
  margin: 0;
`;


const OffersSummary = styled.div`
  display: flex;
  width: 100%;
  max-width: 282px;
  gap: 20px;
  font-size: 16px;
  color: #525252;
  font-weight: 500;
  justify-content: space-between;
  margin: 34px 0 0 45px;
  @media (max-width: 991px) {
    margin-left: 10px;
  }
`;

const OffersTitle = styled.h3`
  font-family: Roboto, sans-serif;
  margin: 0;
`;

const TotalOffersTitle = styled.h3`
  font-family: Roboto, sans-serif;
  margin: 0;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid rgba(230, 230, 230, 0.5);
  background-color: rgba(230, 230, 230, 0.5);
  width: 100%;
  max-width: 534px;
  margin: 13px 0 0 14px;
`;

const OfferItem = styled.div`
  display: flex;
  width: 100%;
  max-width: 299px;
  gap: 20px;
  font-weight: 400;
  justify-content: space-between;
  margin: 15px 0 0 44px;
  @media (max-width: 991px) {
    margin-left: 10px;
  }
`;

const OfferTitle = styled.h4`
  color: #525252;
  margin: auto 0;
  font: 14px Roboto, sans-serif;
`;

const OfferDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const OfferValue = styled.p`
  color: #525252;
  font: 14px Roboto, sans-serif;
  margin: 0;
`;

const OfferDescription = styled.p`
  color: #7b7b7b;
  margin: 6px 0 0;
  font: 12px Roboto, sans-serif;
`;





export default AssignedSpecialist;