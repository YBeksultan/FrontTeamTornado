import React, { useState, useEffect, useRef} from 'react';
import styled from "styled-components";
import Spinner from '../spinner/spinner';
import { fetchUserData, getGrades, getProposerById, getComments, fetchGradedProposalData, fetchProposalData, fetchGradingsData, 
  addComment, updateProposalStatusArchive, fetchProposersData, setSpecialist, getImageById } from '../../services/apiService';
  import { Link } from 'react-router-dom';
  import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Avatar from '../../images/User-512.webp';
import '../CSS/style.css'; 
import toast, { Toaster } from 'react-hot-toast';

export const logOut = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userRole');
    window.location.href = "../login";
};


function Assigned(props) {
  const [imageSrc, setImageSrc] = useState(null);
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
  
    const handleAssignClick = async () => {
      try{
      const date = new Date(selectedDate);
      const year = date.getFullYear();
      const month = ('0' + (date.getMonth() + 1)).slice(-2);
      const day = ('0' + date.getDate()).slice(-2);

      if(isEmployeeSelected && isCalendarSelected){
        await setSpecialist(proposalData[currentIndex].id, allProposers[selectedEmployee].user.id, selectedDate);
        toast.success("Proposal assigned to specialist");
        
        setShowCalendar(false);
        updateProposalList();
        setSelectedEmployee(-1);
        setSelectedDate(new Date());
        setIsEmployeeSelected(false);
        setIsCalendarSelected(false);
      }
      else {
        if(isCalendarSelected){
          toast('Select an employee', {
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
        } else if(isEmployeeSelected){
          toast('Select a deadline', {
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
        } else {
          toast('Select an employee and deadline', {
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
        }
      }
      } catch (error) {
      console.error(error);
    }
    };

    const handleDateChange = (date) => {
      if (date >= new Date()) {
        setIsCalendarSelected(true);
        setSelectedDate(date);
      }
    };
  
    const handleEmployeeSelect = (index) => {
      setIsEmployeeSelected(true);
      setSelectedEmployee(index);
    };
  
    const tileDisabled = ({ date, view }) => {
      if (view === "month") {
        return date < new Date();
      }
    };

    const employeeSearchHandler = (event) => {
      const { value } = event.target;
      setQuery(value);
      if (value === '') {
        setSelectedProposers(allProposers);
      } else{
      
      const filteredProposals = allProposers.filter(proposer => {
        const fullName = `${proposer.user.first_name} ${proposer.user.last_name}`;
        return fullName.toLowerCase().includes(value.toLowerCase());
      });
        setSelectedProposers(filteredProposals);
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
    
  const fetchData = async () => {
    try {
      const allProposalsResponse = await fetchProposalData();
      const userDataResponse = await fetchUserData();
      const proposalDataResponse = await fetchGradedProposalData();
      const gradingsDataResponse = await fetchGradingsData();
      const proposersDataResponse = await fetchProposersData();
      const transformedData = [];
      proposersDataResponse.forEach((item, index) => {
        transformedData[index] = item;
      });
      setSelectedEmployee(transformedData.length-1);
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
        if(proposer.user.avatar){
          const imageResponse = await getImageById(proposer.user.avatar);
          setProfileImageSrc(imageResponse.image);
        } else {
          setProfileImageSrc(null);
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
      const updatedProposalData = await fetchGradedProposalData();
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
        } else {
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
    const nextProposal = proposalData.find((data, index) => index > currentIndex && data.status === "Graded");
    if (nextProposal) {
      if(nextProposal.proposer != proposersData.proposer){
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
      await fetchProposerData(nextProposal.proposer);
      await fetchCommentsData(nextProposal.id);
  };

  const handleBack = () => {
    const prevProposal = proposalData.slice(0, currentIndex).reverse().find(data => data.status === "Graded");
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

  const searchInputChange = (event) => {
    const { value } = event.target;
    setQuery(value);
    if (value === '') {
      setProposersProposals(proposersProposalsFull);
    } else{
    
      const filteredProposals = proposersProposalsFull.filter(proposal => {
      return proposal.title.toLowerCase().includes(value.toLowerCase());
    });
      setProposersProposals(filteredProposals);
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
            <Container className='not-selected'>
            <Button className='not-selected'
              loading="lazy"
            ><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#7D7D7D"><path d="m354-287 126-76 126 77-33-144 111-96-146-13-58-136-58 135-146 13 111 97-33 143ZM233-120l65-281L80-590l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Zm247-350Z"/></svg>
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
            <Container className='selected'>
            <Button className='selected'
              loading="lazy"
            ><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#363636"><path d="m424-318 282-282-56-56-226 226-114-114-56 56 170 170ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h168q13-36 43.5-58t68.5-22q38 0 68.5 22t43.5 58h168q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm280-590q13 0 21.5-8.5T510-820q0-13-8.5-21.5T480-850q-13 0-21.5 8.5T450-820q0 13 8.5 21.5T480-790ZM200-200v-560 560Z"/></svg>
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
                <Column>
                  {proposalData.map((data, index) => (
                    <Div12
                      className={`slide ${index === currentIndex ? 'active' : ''} ${index < currentIndex ? 'slideToLeft' : index > currentIndex ? 'slideToRight' : ''}`}
                      key={data.id}
                    >
                      <Div13>
                        <Div14>{formatDate(data.created_at)}</Div14>
                        <Div15>
                          <SetSpecialistButton onClick={() => setShowCalendar(!showCalendar)}>Set a specialist</SetSpecialistButton>
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
                  <SearchInput>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M11.4601 10.3188L15.7639 14.6227C15.9151 14.7741 16.0001 14.9793 16 15.1933C15.9999 15.4074 15.9148 15.6126 15.7635 15.7639C15.6121 15.9151 15.4068 16.0001 15.1928 16C14.9788 15.9999 14.7736 15.9148 14.6223 15.7635L10.3185 11.4595C9.03194 12.4561 7.41407 12.925 5.79403 12.771C4.17398 12.617 2.67346 11.8516 1.59771 10.6305C0.521957 9.40935 -0.0482098 7.82428 0.00319691 6.1977C0.0546036 4.57112 0.723722 3.02522 1.87443 1.87448C3.02514 0.72374 4.57101 0.054605 6.19754 0.00319699C7.82408 -0.048211 9.40911 0.52197 10.6302 1.59775C11.8513 2.67352 12.6167 4.17409 12.7707 5.79417C12.9247 7.41426 12.4558 9.03217 11.4593 10.3188H11.4601ZM6.4003 11.1996C7.67328 11.1996 8.89412 10.6939 9.79425 9.7937C10.6944 8.89354 11.2001 7.67267 11.2001 6.39966C11.2001 5.12665 10.6944 3.90577 9.79425 3.00562C8.89412 2.10546 7.67328 1.59976 6.4003 1.59976C5.12732 1.59976 3.90648 2.10546 3.00634 3.00562C2.10621 3.90577 1.60052 5.12665 1.60052 6.39966C1.60052 7.67267 2.10621 8.89354 3.00634 9.7937C3.90648 10.6939 5.12732 11.1996 6.4003 11.1996Z" fill="#848484"/>
                  </svg>
                <input
                  type="text"
                  value={query}
                  onChange={searchInputChange}
                  placeholder="Search"
                />
                </SearchInput>
                
                <TableWrapper>
      <TableHeader>
        <TableHeaderLabel className="headerLabel">Date</TableHeaderLabel>
        <TableHeaderLabel className='proposal_title headerLabel'>Proposal title</TableHeaderLabel>
        { 
          (() => {
            const reversedElements = [];
            gradingsData.slice().reverse().forEach((item, index) => {
              reversedElements.push(
                <TableHeaderLabel key={index} className="headerLabel">
                  {item.name}
                </TableHeaderLabel>
              );
            });
            return reversedElements;
          })()
        }
      </TableHeader>
      <TableBody>
        {proposersProposals.map((item, rowIndex) => (
          <TableRow key={rowIndex}>
            <TableRowLabel style={{ width: headerLabelWidths[0] }}>{item.graded_at.split('T')[0]}</TableRowLabel>
            <TableRowLabel style={{ width: headerLabelWidths[1] }}>{item.title}</TableRowLabel>
            {grades.has(item.id) &&
              grades.get(item.id).map((gradings, index) => (
                <TableRowLabel key={index} style={{ width: headerLabelWidths[index + 2] }}>
                  {gradings.score}/{gradings.grading.score}
                </TableRowLabel>
              ))}
          </TableRow>
        ))}
      </TableBody>
    </TableWrapper>
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
      {showCalendar && <BackgroundOverlay />}
      {showCalendar && (
        <CalendarContainer ref={calendarRef}>
      <CalendarHeader>Set a specialist</CalendarHeader>
      <CalendarContent>
        <EmployeeCalendar>
          <EmployeeSearch>
          <input
                  type="text"
                  value={query}
                  onChange={employeeSearchHandler}
                  placeholder="Employee search"
                />
          </EmployeeSearch>
          <EmployeeItemWrapper>
          {selectedProposers.map((item, index) => (
            <EmployeeItem
            isSelected={index === selectedEmployee}
            onClick={() => handleEmployeeSelect(index)}
          >
            <CalendarCheckbox isSelected={index === selectedEmployee} />
            <EmployeeName>
              {item.user.first_name} {item.user.last_name} {item.department || ''}
            </EmployeeName>
          </EmployeeItem>
          )
          )}
          </EmployeeItemWrapper>
        </EmployeeCalendar>
        <CalendarSection>
          <StyledCalendar
            value={selectedDate}
            onChange={handleDateChange}
            tileDisabled={tileDisabled}
            minDate={new Date()}
          />
          <CalendarFooter>
            <SelectedDate>
              {selectedDate.getFullYear()} y. {selectedDate.getDate()}{" "}
              {selectedDate.toLocaleString("default", { month: "long" })}
            </SelectedDate>
            <AssignButton onClick={handleAssignClick}>Assign</AssignButton>
          </CalendarFooter>
        </CalendarSection>
      </CalendarContent>
    </CalendarContainer>
      )}
      <Toaster />
    </Div>
    </>
  );
}

const LogoKaizen = styled.img`
  aspect-ratio: 1.12;
  padding: 0 5px;
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
  z-index: 100;
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
  z-index: 50;
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
  margin-top: 55px;
  @media (max-width: 991px) {
    max-width: 100%;
    margin-top: 40px;
  }
`;
const TableWrapper = styled.div`
  width: 100%;
  background-color: #fff;
  margin-top: 17px;
  margin-bottom: 70px;
`;
const TableHeader = styled.div`
  display: flex;
  width: 100%;
  background-color: #fff;
  @media (max-width: 991px) {
    max-width: 100%;
    flex-wrap: wrap;
    padding-right: 20px;
  }
`;
const TableHeaderLabel = styled.div`
  background-color: #fff;
  flex: 1;
  padding: 4px;
  border: 1px solid #d3d3d3;
  font-family: Roboto, sans-serif;
  font-size: 11px;
  display: flex;
  line-height: 1.3;
  justify-content: center;
  align-items: center;
  font-weight: bold;
`;
const TableBody = styled.div`
  display: flex;
  flex-direction: column;  
  @media (max-width: 991px) {
    margin-right: 5px;
  }
`;
const TableRow = styled.div`
  display: flex;
  
  @media (max-width: 991px) {
    max-width: 100%;
    flex-wrap: wrap;
  }
`;
const TableRowLabel = styled.div`
border: 1px solid #d3d3d3;
font-family: Roboto, sans-serif;
font-size: 11px;
padding: 8px 0;
display:flex;
align-items: center;
justify-content: center;
`;
const SearchInput = styled.div`
  z-index: 1;
  margin-top: 293px;
  height: 40px;
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 0 15px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.1);
    
  @media (max-width: 991px) {
    flex-wrap: wrap;
  }
`;
const SearchIcon = styled.img`
  width: 16px;
  height: 16px;
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
const SetSpecialistButton = styled.button`
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
  z-index: 11;
  flex-direction: column;
  line-height: normal;
  width: 30%;
  margin-left: 20px;
  @media (max-width: 991px) {
    width: 100%;
  }
`;
const ProposerInfoWrapper = styled.div`
  display: flex;
`;
const ProposerFullName = styled.div`
  font: 500 18px Roboto, sans-serif;
  margin: 0;
`;
const ProposerImg = styled.img`
  aspect-ratio: 1;
  object-fit: auto;
  object-position: center;
  border-radius: 50%;
  width: 100px;
`;



const BackgroundOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* Black with 50% opacity */
  z-index: 5;
`;

const CalendarContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  background-color: #fff;
  max-width: 691px;
`;

const CalendarHeader = styled.header`
  border-radius: 8px 8px 0 0;
  background-color: #f5f6f7;
  color: #444950;
  padding: 11px 15px;
  font: 500 15px Roboto, sans-serif;
  @media (max-width: 991px) {
    padding-right: 20px;
  }
`;

const CalendarContent = styled.div`
  display: flex;
  gap: 20px;
  @media (max-width: 991px) {
    flex-direction: column;
  }
`;

const EmployeeCalendar = styled.section`
  display: flex;
  flex-direction: column;
  width: 50%;
  margin: 25px 0 0 21px;
  font-size: 15px;
  color: #444950;
  @media (max-width: 991px) {
    width: 100%;
    margin-left: 20px;
  }
`;

const EmployeeSearch = styled.div`
  border-radius: 8px;
  border: 1px solid #c4c4c4;
  background-color: #fff;
  color: #c4c4c4;
  padding: 12px 15px;
  font: 300 15px Roboto, sans-serif;
  @media (max-width: 991px) {
    padding-right: 20px;
  }
`;
const EmployeeItemWrapper = styled.div`
  width: 300px;
  max-height: 350px;
  overflow-y: auto;
`;
const EmployeeItem = styled.div`
  display: flex;
  gap: 9px;
  align-items: center;
  background-color: ${(props) => (props.isSelected ? "#ecf3ff" : "transparent")};
  padding: ${(props) => (props.isSelected ? "11px 17px 11px 5px" : "0")};
  margin-top: ${(props) => (props.isSelected ? "10px" : "21px")};
  cursor: pointer;
  @media (max-width: 991px) {
    margin-left: ${(props) => (props.isSelected ? "0" : "10px")};
  }
`;

const CalendarCheckbox = styled.span`
  border-radius: 9px;
  border: 1px solid ${(props) => (props.isSelected ? "#1877f2" : "#d3d3d3")};
  background-color: ${(props) => (props.isSelected ? "#ecf3ff" : "transparent")};
  width: 14px;
  height: 14px;
`;

const EmployeeName = styled.span`
  font: 400 15px Roboto, sans-serif;
`;

const CalendarSection = styled.section`
  border-radius: 0 8px 8px 0;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  background-color: #fff;
  width: 50%;
  padding: 29px 0;
  @media (max-width: 991px) {
    width: 100%;
  }
`;

const StyledCalendar = styled(Calendar)`
  margin: 0 auto;
  .react-calendar {
    border: none;
    width: 100%;
    max-width: 100%;
    background: white;
    font-family: Roboto, sans-serif;
    line-height: 1.125em;
  }
  .react-calendar__navigation {
    display: flex;
    height: 44px;
    margin-bottom: 1em;
  }
  .react-calendar__navigation button {
    min-width: 44px;
    background: none;
    font-size: 16px;
    margin-top: 8px;
  }
  .react-calendar__navigation button:enabled:hover,
  .react-calendar__navigation button:enabled:focus {
    background-color: #f8f8fa;
  }
  .react-calendar__navigation button[disabled] {
    background-color: #f0f0f0;
  }
  .react-calendar__month-view__weekdays {
    text-align: center;
    text-transform: uppercase;
    font-weight: bold;
    font-size: 0.75em;
  }
  .react-calendar__month-view__weekdays__weekday {
    padding: 0.5em;
  }
  .react-calendar__month-view__weekNumbers .react-calendar__tile {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75em;
    font-weight: bold;
  }
  .react-calendar__month-view__days__day--weekend {
    color: #d10000;
  }
  .react-calendar__month-view__days__day--neighboringMonth {
    color: #757575;
  }
  .react-calendar__year-view .react-calendar__tile,
  .react-calendar__decade-view .react-calendar__tile,
  .react-calendar__century-view .react-calendar__tile {
    padding: 2em 0.5em;
  }
  .react-calendar__tile {
    aspect-ratio: 1/1;
    max-width: 100%;
    background: none;
    text-align: center;
  }
  .react-calendar__tile:disabled {
    background-color: #f0f0f0;
  }
  .react-calendar__tile:enabled:hover,
  .react-calendar__tile:enabled:focus {
    background: #f8f8fa;
    color: #1871ed;
    border-radius: 8px;
  }
  .react-calendar__tile--now {
    background: #1871ed33;
    border-radius: 8px;
    font-weight: bold;
    color: #1871ed;
  }
  .react-calendar__tile--now:enabled:hover,
  .react-calendar__tile--now:enabled:focus {
    background: #1871ed33;
    border-radius: 8px;
    font-weight: bold;
    color: #1871ed;
  }
  .react-calendar__tile--hasActive {
    background: #76baff;
  }
  .react-calendar__tile--hasActive:enabled:hover,
  .react-calendar__tile--hasActive:enabled:focus {
    background: #a9d4ff;
  }
  .react-calendar__tile--active {
    background: #1871ed;
    border-radius: 8px;
    color: white;
  }
  .react-calendar__tile--active:enabled:hover,
  .react-calendar__tile--active:enabled:focus {
    background: #1871ed;
    color: white;
  }
  .react-calendar--selectRange .react-calendar__tile--hover {
    background-color: #e6e6e6;
  }
`;

const CalendarFooter = styled.footer`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 30px;
  padding: 0 26px;
`;

const SelectedDate = styled.span`
  font: 400 16px Roboto, sans-serif;
  color: #444950;
`;

const AssignButton = styled.button`
  border-radius: 8px;
  background-color: #1871ed;
  color: #fff;
  padding: 10px 30px;
  font: 400 18px Roboto, sans-serif;
  cursor: pointer;
  @media (max-width: 991px) {
    padding: 16px 20px;
  }
`;


export default Assigned;