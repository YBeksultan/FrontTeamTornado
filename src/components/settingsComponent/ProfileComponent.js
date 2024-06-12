import React, { useState, useEffect, useRef } from 'react';
import styled from "styled-components";
import Spinner from '../spinner/spinner';
import { fetchUserData, editProfile, getImageById, API_URL } from '../../services/apiService';
import Avatar from '../../images/User-512.webp';
import toast, { Toaster } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import '../CSS/style.css';

export const logOut = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('userRole');
  window.location.href = "../login";
};


function SettingsProfileComponent(props) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const profileData = {
    phoneNumber: "+7 (778) 485 9242",
  };


  const [imageSrc, setImageSrc] = useState(null);
  const [firstName, setFirstName] = useState(null);
  const [lastName, setLastName] = useState(null);
  const [email, setEmail] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState(profileData.phoneNumber);
  const fileInputRef = useRef(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formData, setFormData] = useState(new FormData());
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const storedUserRole = localStorage.getItem('userRole');
    if (storedUserRole) {
      setUserRole(storedUserRole);
    }
  }, []);
  
  const handleImageClick = () => {
    fileInputRef.current.click();
  };
  
  const handleImageChange = async (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      try {
        
        const fileType = selectedFile.type;

        if (!fileType.startsWith('image/')) {
          toast.error('Please select an image file');
          return;
        }

        const formAvatar = new FormData();
        formAvatar.append('image', selectedFile);

       
        setFormData(formAvatar);

        const imageUrl = URL.createObjectURL(selectedFile);
        setImageSrc(imageUrl);
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
  };
  const handleSave = () => {
    if(firstName != userData.first_name || lastName != userData.last_name
      || email != userData.email || formData.has('image')){
      setShowConfirmation(true);
    } else {
      toast.error("No changes were noticed.");
    }
  };

  const handleCancel = async() => {
    if(userData.avatar){
      const imageResponse = await getImageById(userData.avatar);
      setImageSrc(imageResponse.image);
    } else {
      setImageSrc(null);
    }
    setEmail(userData.email);
    setFirstName(userData.first_name);
    setLastName(userData.last_name);
  };

  useEffect(() => {
    if (showConfirmation) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [showConfirmation]);
  

  const handleConfirm = async () => {
    try { 
          setShowConfirmation(false);
          if(formData.has('image')){
          const response = await fetch(`${API_URL}/images/`,{
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            }
          } ,{
          method: 'POST',
          body: formData
          });
          if (!response.ok) {
            throw new Error('Failed to upload file');
          }
          console.log('File uploaded successfully');
          const responseData = await response.json();
          console.log(responseData);
          await editProfile(userData.id, email,firstName, lastName, responseData[responseData.length-1].id);
          } else {
          await editProfile(userData.id, email,firstName, lastName, null);
          }
          toast.success('Successfully changed');
          window.location.reload();
        } catch (error) {
          console.error('Error uploading file:', error);
        }
 
  };

  const handleConfirmCancel = () => {
    setShowConfirmation(false);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };


  const today = new Date();
  const formattedDate = `${today.getDate()} ${today.toLocaleString('default', { month: 'long' })} ${today.getFullYear()}`;

  const fetchData = async () => {
    try {
      const userDataResponse = await fetchUserData();

      if(userDataResponse){
        if(userDataResponse.avatar){
          const imageResponse = await getImageById(userDataResponse.avatar);
          setImageSrc(imageResponse.image);
        }
        setUserData(userDataResponse);
        setEmail(userDataResponse.email);
        setFirstName(userDataResponse.first_name);
        setLastName(userDataResponse.last_name);
      }
      console.log("User data", userDataResponse);
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

  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Intl.DateTimeFormat('en-EN', options).format(new Date(dateString));
  };
  return (
    <>
    <Div>
      <Div2>
      {userRole === 'staff' && <Div3>
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
            <Container className='selected'>
            <Button className='selected'
              loading="lazy"
            ><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z" fill='#363636'/></svg>
            </Button>
            <HoverText className='selected'>Settings</HoverText>
            </Container>
          </Link>
          </NavBar>
        </Div3>}
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
          <ProfileContainer>
          <OtherOptions>
          <UserInfo>
          <UserInfoImg
                  srcSet={imageSrc || Avatar}
                  alt="Person Image"
                  width="60"
                  height="60"
                />
          <UserNameAndRole>
          {userRole === 'proposer' ? (<Link to={`/profile/${userData.proposer.id}`} 
          style={{textDecoration: 'none', color: '#333'}}> 
            <UserName>{firstName}</UserName>
            </Link>) : (
            <UserName>{firstName}</UserName>
            )}
            
            <UserRole>
                {userRole}
            </UserRole>
          </UserNameAndRole>
          </UserInfo>
          <OptionsMenu>
            <MenuOption className='selected'>
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Zm80-80h480v-32q0-11-5.5-20T700-306q-54-27-109-40.5T480-360q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T560-640q0-33-23.5-56.5T480-720q-33 0-56.5 23.5T400-640q0 33 23.5 56.5T480-560Zm0-80Zm0 400Z"/></svg>
              Profile Information
            </MenuOption>

            <MenuOption>
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z"/></svg>
              Account
            </MenuOption>

            <MenuOption>
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M240-120q-45 0-89-22t-71-58q26 0 53-20.5t27-59.5q0-50 35-85t85-35q50 0 85 35t35 85q0 66-47 113t-113 47Zm0-80q33 0 56.5-23.5T320-280q0-17-11.5-28.5T280-320q-17 0-28.5 11.5T240-280q0 23-5.5 42T220-202q5 2 10 2h10Zm230-160L360-470l358-358q11-11 27.5-11.5T774-828l54 54q12 12 12 28t-12 28L470-360Zm-190 80Z"/></svg>
              Appearance
            </MenuOption>

            <MenuOption>
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M160-200v-80h80v-280q0-83 50-147.5T420-792v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v280h80v80H160Zm320-300Zm0 420q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM320-280h320v-280q0-66-47-113t-113-47q-66 0-113 47t-47 113v280Z"/></svg>
              Notification
            </MenuOption>

            <MenuOption>
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm320-280L160-640v400h640v-400L480-440Zm0-80 320-200H160l320 200ZM160-640v-80 480-400Z"/></svg>
              Emails
            </MenuOption>
            
          </OptionsMenu>
          </OtherOptions>
          <ProfileWrapper>
          <ProfileInfoLabel>
            Profile Information
          </ProfileInfoLabel>
          <Divider />
          <ProfileForm>
            <ProfileContent>
                  <ProfileFieldsWrapper>
                    <ProfileFieldColumn>
                      <ProfileFieldWrapper>
                        <ProfileFieldLabel>First Name</ProfileFieldLabel>
                        <ProfileFieldInput
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                        />
                      </ProfileFieldWrapper>
                    </ProfileFieldColumn>
                    <ProfileFieldColumn>
                      <ProfileFieldWrapper>
                        <ProfileFieldLabel>Last Name</ProfileFieldLabel>
                        <ProfileFieldInput
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                        />
                      </ProfileFieldWrapper>
                    </ProfileFieldColumn>
                  </ProfileFieldsWrapper>
                  <ProfileEmailWrapper>
                    <ProfileFieldLabel>Email</ProfileFieldLabel>
                    <ProfileEmailField>
                      <ProfileEmailInput value={email} onChange={(e) => setEmail(e.target.value)}/>
                      {/* <ProfileEmailIcon src="https://cdn.builder.io/api/v1/image/assets/TEMP/db9ab4fee0d11a8cb3f572c338126ba8a5ccfaba8defc20bb7861234c2ba8103?apiKey=f933b1b419864e2493a2da58c5eeea0a&" /> */}
                    </ProfileEmailField>
                  </ProfileEmailWrapper>
                  <ProfilePhoneWrapper>
                  <ProfileFieldLabel>Phone number</ProfileFieldLabel>
                  <ProfilePhoneInput
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                  </ProfilePhoneWrapper>
              </ProfileContent>
                <ProfileImageContainer>
                  <EditProfileButton onClick={handleImageClick}> 
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg>
                  Edit</EditProfileButton>
                  <ImageLabel>Profile Picture</ImageLabel>
                  <ProfileImage src={imageSrc || Avatar} onClick={handleImageClick}/>
                  <input
                    type="file"
                    accept="image/*" 
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleImageChange}
                  />
                </ProfileImageContainer>
            </ProfileForm>
            <ProfileActions>
            
            <ProfileSaveButton onClick={handleSave}>Save</ProfileSaveButton>
            <ProfileCancelButton onClick={handleCancel}>
              Cancel
            </ProfileCancelButton>
          </ProfileActions>
          </ProfileWrapper>
          
          {showConfirmation && (
            <>
            <ConfirmationOverlay />
            <ConfirmationDialog>
              <p>Are you sure you want to apply the changes?</p>
              <ConfirmationWrapper>
                <ConfirmationButton onClick={handleConfirmCancel}>Cancel</ConfirmationButton>
                <ConfirmationButton className='confirm_ok_btn' onClick={handleConfirm}>OK</ConfirmationButton>
              </ConfirmationWrapper>
            </ConfirmationDialog>
            </>
          )}
          </ProfileContainer> 
        </Div4>
      </Div2>
    </Div>
    <Toaster toastOptions={{
        error: {
          duration: 1500,
        },
      }}/>
    </>
  );
}

const ProfileContainer = styled.div`
  border-radius: 10px;
  display: flex;
  background-color: #fff;
  align-items: start;
  height: 70vh;
  padding: 50px 0 40px 30px;
  @media (max-width: 991px) {
    padding: 0 20px;
  }
`;
const OtherOptions = styled.div`
  margin-right: 100px;
  @media (max-width: 991px) {
    max-width: 100%;
  }
`;

const OptionsMenu = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 30px;
  @media (max-width: 991px) {
    max-width: 100%;
  }
`;

const MenuOption = styled.div`
  padding: 10px 5px;
  cursor: pointer;
  padding-right: 30px;
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  &:hover{
    background-color: #f2f3f4;
    border-top-right-radius: 10px;
    border-bottom-right-radius: 10px;
  }
  &.selected {
    font-weight: 600;
    background-color: #f2f3f4;
    border-top-right-radius: 10px;
    border-bottom-right-radius: 10px;
  }
  &.selected::before {
    content: '';
    position: absolute;
    left: -5px;
    top: 0;
    bottom: 0;
    width: 4px;
    border-radius: 3px;
    background-color: #0080FF;
  }
  @media (max-width: 991px) {
    max-width: 100%;
  }
`;


const UserInfo = styled.div`
  display: flex;
  gap: 20px;
`;

const UserNameAndRole = styled.div`
  padding: 8px 0;
  display: flex;
  gap: 5px;
  flex-direction: column;
`;

const UserName = styled.label`
  cursor: pointer;
  color: #4e4e4e;
  font: 600 18px Roboto, sans-serif;
  
  &:hover{
    text-decoration: underline;
  }
`;

const UserRole = styled.label`
  cursor: pointer;
  color: #8e8e8e;
  text-transform: capitalize;
  font: 400 15px Roboto, sans-serif;
`;

const ProfileWrapper = styled.div`
  display: flex;
  flex-direction: column;
  @media (max-width: 991px) {
    max-width: 100%;
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
const ProfileInfoLabel = styled.div`
  margin-top: 20px;
  font-size: 26px;
  color: #363636;
  @media (max-width: 991px) {
    max-width: 100%;
  }
`;

const ProfileContent = styled.div`
  
`;

const ProfileDetails = styled.div`
  display: flex;
  flex-direction: column;
  line-height: normal;
  width: 85%;
  margin-left: 0px;
  @media (max-width: 991px) {
    width: 100%;
  }
`;

const ProfileForm = styled.div`
  display: flex;
  margin-top: 30px;
  @media (max-width: 991px) {
    max-width: 100%;
    margin-top: 40px;
  }
`;

const ProfileTitle = styled.h2`
  color: #1871ed;
  font: 500 25px Roboto, sans-serif;
  @media (max-width: 991px) {
    max-width: 100%;
  }
`;

const ProfileFieldsWrapper = styled.div`
  gap: 20px;
  display: flex;
  @media (max-width: 991px) {
    flex-direction: column;
    align-items: stretch;
    gap: 0px;
  }
`;

const ProfileFieldColumn = styled.div`
  display: flex;
  flex-direction: column;
  line-height: normal;
  width: 50%;
  @media (max-width: 991px) {
    width: 100%;
  }
`;

const ProfileFieldWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-self: stretch;
  margin: auto 0;
  @media (max-width: 991px) {
    margin-top: 40px;
  }
`;

const ProfileFieldLabel = styled.label`
  color: #6e6e6e;
  font: 600 18px Roboto, sans-serif;
`;

const ProfileFieldInput = styled.input`
  border-radius: 5px;
  border: 2px solid rgba(133, 133, 133, 1);
  background-color: #fff;
  margin-top: 15px;
  align-items: start;
  color: #858585;
  white-space: nowrap;
  justify-content: center;
  padding: 8px 8px;
  font: 500 16px Roboto, sans-serif;
  @media (max-width: 991px) {
    white-space: initial;
    padding: 0 20px;
  }
`;

const ProfileEmailWrapper = styled.div`
  display: flex;
  margin-top: 15px;
  width: 100%;
  flex-direction: column;
`;

const ProfileEmailField = styled.div`
  display: flex;
  flex-direction: column;
  align-self: stretch;
  margin: auto 0;
  @media (max-width: 991px) {
    margin-top: 40px;
  }
`;

const ProfileEmailInput = styled.input`
  border-radius: 5px;
  border: 2px solid rgba(133, 133, 133, 1);
  background-color: #fff;
  margin-top: 15px;
  align-items: start;
  color: #858585;
  white-space: nowrap;
  justify-content: center;
  padding: 8px 8px;
  font: 500 16px Roboto, sans-serif;
  @media (max-width: 991px) {
    white-space: initial;
    padding: 0 20px;
  }
`;

const ProfileEmailIcon = styled.img`
  aspect-ratio: 1;
  object-fit: auto;
  object-position: center;
  width: 26px;
`;
const ProfilePhoneWrapper = styled.div`
  display: flex;
  margin-top: 15px;
  width: 100%;
  flex-direction: column;
`;
const ProfileImageColumn = styled.div`
  font-size: 25px;
  display: flex;
  flex-direction: column;
  line-height: normal;
  width: 15%;
  margin-left: 50px;
  @media (max-width: 991px) {
    width: 100%;
  }
`;
const EditProfileButton = styled.button`
  top: 185px;
  cursor: pointer;
  display: flex;
  font-size: 15px;
  gap: 5px;
  color: #5f6163;
  padding: 2px 5px;
  align-items: center;
  border: 1px solid #D3D3D3;
  border-radius: 8px;
  position: absolute;
  background-color: #fff;
  text-decoration: none;
  outline: none;
  @media (max-width: 991px) {
    margin-top: 40px;
  }
`;

const ProfileImageContainer = styled.div`
  position: relative;
  display: flex;
  margin-left: 100px;
  flex-direction: column;
  font-size: 20px;
  color: #6e6e6e;
  font-weight: 500;
  @media (max-width: 991px) {
    margin-top: 40px;
  }
`;

const ProfileImage = styled.img`
  aspect-ratio: 1.04;
  object-fit: auto;
  object-position: center;
  width: 200px;
  border-radius: 50%;
  cursor: pointer;
`;

const ImageLabel = styled.div`
  color: #363636;
  margin-bottom: 10px;
  font-weight: 500;
  font-size: 15px;
`;

const ProfilePhoneInput = styled.input`
  border-radius: 5px;
  border: 2px solid rgba(133, 133, 133, 1);
  background-color: #fff;
  max-width: 100%;
  align-items: start;
  color: #858585;
  justify-content: center;
  margin-top: 15px;
  padding: 8px 8px;
  font: 500 16px Roboto, sans-serif;
  @media (max-width: 991px) {
    padding: 0 20px;
  }
`;

const ProfileActions = styled.div`
  display: flex;
  margin-top: 40px;
  gap: 20px;
  font-size: 28px;
  @media (max-width: 991px) {
    white-space: initial;
    margin: 40px 0 0 10px;
  }
`;

const ProfileCancelButton = styled.button`
  cursor: pointer;
  font-family: Roboto, sans-serif;
  border-radius: 5px;
  border: 2px solid rgba(16, 156, 241, 1);
  background-color: #fff;
  color: #109cf1;
  font-weight: 400;
  font-size: 15px;
  justify-content: center;
  padding: 10px 10px;
  @media (max-width: 991px) {
    white-space: initial;
    padding: 0 20px;
  }
`;

const ProfileSaveButton = styled.button`
  cursor: pointer;
  font-family: Roboto, sans-serif;
  border-radius: 5px;
  background-color: #109cf1;
  color: #fff;
  font-weight: 600;
  justify-content: center;
  padding: 10px 15px;
  @media (max-width: 991px) {
    white-space: initial;
    padding: 0 20px;
  }
`;
const LogoKaizen = styled.img`
  aspect-ratio: 1.12;
  object-fit: contain;
  object-position: center;
  padding: 0 5px;
  width: 43px;
`;

const Div = styled.div`
  background-color: #f2f2f2;
  display: flex;
  height: 100vh;
  flex-direction: column;
`;
const Div2 = styled.div`
  display: flex;
  padding-right: 10px;
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
  display: flex;
  margin-top: 7px;
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
  margin-bottom: 5px;
  font-family: Roboto, sans-serif;
  border-radius: 8px;
  border: 1px solid #d7d7d7;
  background-color: #fff;
  justify-content: center;
  padding: 15px 50px;
  @media (max-width: 991px) {
    white-space: initial;
    padding: 0 20px;
  }
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
const UserInfoImg = styled.img`
  border-radius: 50%;
  aspect-ratio: 1;
  object-fit: auto;
  object-position: center;
  width: 60px;
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
const ConfirmationOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
`;

const ConfirmationDialog = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  z-index: 999;
`;

const ConfirmationWrapper = styled.div`
  display: flex;
  justify-content: space-around;
  margin-top: 20px;
`;

const ConfirmationButton = styled.button`
padding: 10px 20px;
border-radius: 4px;
cursor: pointer;
outline: none;
border: none;
background-color: #ccc;
color: black;
&.confirm_ok_btn {
  background-color: #109cf1;
  color: white;
}
`;
export default SettingsProfileComponent;