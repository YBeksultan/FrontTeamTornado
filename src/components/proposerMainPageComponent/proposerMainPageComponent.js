import React, { useState, useEffect } from 'react';
import styled from "styled-components";
import { Link } from 'react-router-dom';
import { LineChart } from '@mui/x-charts';
import Spinner from '../spinner/spinner';
import { getImageById, fetchUserData, fetchProposalData} from '../../services/apiService';
import Avatar from '../../images/User-512.webp';
import dayjs from "dayjs";
import '../CSS/style.css'; 

export const logOut = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('userRole');
  window.location.href = "../login";
};



function ProposerMainPage(props) {
  const [appearances, setAppereances] = useState({});
  const [userData, setUserData] = useState(null);
  const [proposalData, setProposalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [proposalDataByDays, setProposalDataByDays] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const storedUserRole = localStorage.getItem('userRole');
    if (storedUserRole) {
      setUserRole(storedUserRole);
    }
  }, []);
  
  const handleLogout = () => {
    logOut();
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  let xAxisData;
  let yAxisData;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userDataResponse = await fetchUserData();
        const proposalData = await fetchProposalData();
        setProposalData(proposalData);
        const filteredArray = proposalData.filter(item => item.proposer === userDataResponse.proposer.id);
        const statusArray = filteredArray.map(item => item.status);
        const createdAtArray = filteredArray.map(item => item.created_at.split('T')[0]);
        const appearances = {};
        statusArray.forEach(status => {
            if (appearances[status]) {
                appearances[status]++;
            } else {
                appearances[status] = 1;
            }
        });
        appearances["Sum"] = statusArray.length;
        console.log(statusArray);
        setAppereances(appearances);
        const dateCounts = createdAtArray.reduce((counts, date) => {
          counts[date] = (counts[date] || 0) + 1;
          return counts;
        }, {});
        
        const today = new Date();
        const currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate()+1);
        
        const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6);
        
        const result = [];
        while (currentDate >= endDate) {
          const dateString = currentDate.toISOString().slice(0, 10);
          const count = dateCounts[dateString] || 0; 
          result.push({ date: dateString, count });
          currentDate.setDate(currentDate.getDate() - 1);
        }
        
        if (userDataResponse) {
          if(userDataResponse.avatar){
            const imageResponse = await getImageById(userDataResponse.avatar);
            setImageSrc(imageResponse.image);
          }
          setUserData(userDataResponse);
        }
        setProposalDataByDays(result.reverse());
  
  
        setLoading(false);
  
        console.log('User Data:', userDataResponse);
      } catch (error) {
        setError(error.message);
        
        console.error('Error fetching user data:', error);
        handleLogout();
      }
    };
  
    fetchData();
  }, []);


  if (proposalDataByDays !== null) {
    xAxisData = proposalDataByDays.map(data => {
      const date = new Date(data.date);
      return date.getTime();
  });
  yAxisData = proposalDataByDays.map(data => {
    const count = data.count;
    return count;
  });
  }

if (loading) {
  return <Spinner/> ;
}
  return (
    <Div>
    <Div26>
              <Div27>
                <Img8
                  loading="lazy"
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/ba2ecc2a8af9615522bd837955f90aa462b022e2f13c46a05493e77f07595398?apiKey=76bc4e76ba824cf091e9566ff1ae9339&"
                />
                <Div28>KaizenCloud</Div28>
              </Div27>
              <DropdownWrapper onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}>
            <MenuPanel>
              <Div8>
                <Img9
                  loading="lazy"
                  srcSet={imageSrc || Avatar}
                  alt="Person Image"
                  width="24"
                  height="24"
                />
                <MenuPanelText>{userData.first_name}</MenuPanelText>
              </Div8>
            </MenuPanel>
            {isHovered && (    
                <DropdownMenu>
                {userRole === 'proposer' && 
                <Link to={`/profile/${userData.proposer.id}`} style={{textDecoration: 'none', color: '#333'}}> 
                  <DropdownItem>
                  <Div8>
                  <MenuPanelText>Profile</MenuPanelText>
              </Div8>
              <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#C4C4C4"><path d="M480-480q-60 0-102-42t-42-102q0-60 42-102t102-42q60 0 102 42t42 102q0 60-42 102t-102 42ZM192-192v-96q0-23 12.5-43.5T239-366q55-32 116.29-49 61.29-17 124.5-17t124.71 17Q666-398 721-366q22 13 34.5 34t12.5 44v96H192Zm72-72h432v-24q0-5.18-3.03-9.41-3.02-4.24-7.97-6.59-46-28-98-42t-107-14q-55 0-107 14t-98 42q-5 4-8 7.72-3 3.73-3 8.28v24Zm216.21-288Q510-552 531-573.21t21-51Q552-654 530.79-675t-51-21Q450-696 429-674.79t-21 51Q408-594 429.21-573t51 21Zm-.21-72Zm0 360Z"/></svg>
                  </DropdownItem>
                  </Link>
                  }
                  <Link to={'/settings/profile'} style={{textDecoration: 'none', color: '#333'}}> 
                  <DropdownItem>
                  <Div8>
                  <MenuPanelText>Settings</MenuPanelText>
              </Div8>
              <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#C4C4C4"><path d="m403-96-22-114q-23-9-44.5-21T296-259l-110 37-77-133 87-76q-2-12-3-24t-1-25q0-13 1-25t3-24l-87-76 77-133 110 37q19-16 40.5-28t44.5-21l22-114h154l22 114q23 9 44.5 21t40.5 28l110-37 77 133-87 76q2 12 3 24t1 25q0 13-1 25t-3 24l87 76-77 133-110-37q-19 16-40.5 28T579-210L557-96H403Zm59-72h36l19-99q38-7 71-26t57-48l96 32 18-30-76-67q6-17 9.5-35.5T696-480q0-20-3.5-38.5T683-554l76-67-18-30-96 32q-24-29-57-48t-71-26l-19-99h-36l-19 99q-38 7-71 26t-57 48l-96-32-18 30 76 67q-6 17-9.5 35.5T264-480q0 20 3.5 38.5T277-406l-76 67 18 30 96-32q24 29 57 48t71 26l19 99Zm18-168q60 0 102-42t42-102q0-60-42-102t-102-42q-60 0-102 42t-42 102q0 60 42 102t102 42Zm0-144Z"/></svg>
                  </DropdownItem>
                  </Link>
                  <DropdownItem onClick={logOut}>
                  <Div8>
                <MenuPanelText>Logout</MenuPanelText>
              </Div8>
              <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#C4C4C4"><path d="M216-144q-29.7 0-50.85-21.15Q144-186.3 144-216v-528q0-29.7 21.15-50.85Q186.3-816 216-816h264v72H216v528h264v72H216Zm432-168-51-51 81-81H384v-72h294l-81-81 51-51 168 168-168 168Z"/></svg>
                  </DropdownItem>
                  </DropdownMenu>   
                      )}
            </DropdownWrapper>     
              
            </Div26>
      <Div2>
            <OtherOptions>
          <UserInfo>
          <UserInfoImg
                  srcSet={imageSrc || Avatar}
                  alt="Person Image"
                  width="60"
                  height="60"
                />
          <UserNameAndRole>
            <Link to={`/profile/${userData.proposer.id}`} style={{textDecoration: 'none', color: '#333'}}> 
            <UserName>{userData.first_name}</UserName>
            </Link>
            <UserRole>
                {userRole}
            </UserRole>
          </UserNameAndRole>
          </UserInfo>

          <Divider />
          <OptionsMenu>
            <Link to="/add_proposal" style={{ textDecoration: 'none', color: '#4e4e4e' }}>
            <MenuOption>
            <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#5f6368"><path d="M186.67-120q-27 0-46.84-19.83Q120-159.67 120-186.67v-586.66q0-27 19.83-46.84Q159.67-840 186.67-840h382.66v66.67H186.67v586.66h586.66v-382.66H840v382.66q0 27-19.83 46.84Q800.33-120 773.33-120H186.67Zm134-158v-66.67H640V-278H320.67Zm0-124.67v-66.66H640v66.66H320.67Zm0-124.66V-594H640v66.67H320.67ZM688-602.67V-688h-85.33v-66.67H688V-840h66.67v85.33H840V-688h-85.33v85.33H688Z"/></svg>
            <MenuOptionLabel>Add Proposal</MenuOptionLabel>
            </MenuOption>
            </Link>
            <Link to="/assigned" style={{ textDecoration: 'none', color: '#4e4e4e' }}>
            <MenuOption>
            <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#5f6368"><path d="M423.33-325.33 702-604l-47.33-47.33L423.33-420 304.67-538.67 258-492l165.33 166.67ZM186.67-120q-27.5 0-47.09-19.58Q120-159.17 120-186.67v-586.66q0-27.5 19.58-47.09Q159.17-840 186.67-840h192.66q7.67-35.33 35.84-57.67Q443.33-920 480-920t64.83 22.33Q573-875.33 580.67-840h192.66q27.5 0 47.09 19.58Q840-800.83 840-773.33v586.66q0 27.5-19.58 47.09Q800.83-120 773.33-120H186.67Zm0-66.67h586.66v-586.66H186.67v586.66Zm293.33-608q13.67 0 23.5-9.83t9.83-23.5q0-13.67-9.83-23.5t-23.5-9.83q-13.67 0-23.5 9.83t-9.83 23.5q0 13.67 9.83 23.5t23.5 9.83Zm-293.33 608v-586.66 586.66Z"/></svg>
            <MenuOptionLabel>Assigned</MenuOptionLabel>
            </MenuOption>
            </Link>
            <Link to={`/profile/${userData.proposer.id}`} style={{ textDecoration: 'none', color: '#4e4e4e' }}>
            <MenuOption>
            <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#5f6368"><path d="M226-262q59-42.33 121.33-65.5 62.34-23.17 132.67-23.17 70.33 0 133 23.17T734.67-262q41-49.67 59.83-103.67T813.33-480q0-141-96.16-237.17Q621-813.33 480-813.33t-237.17 96.16Q146.67-621 146.67-480q0 60.33 19.16 114.33Q185-311.67 226-262Zm253.88-184.67q-58.21 0-98.05-39.95Q342-526.58 342-584.79t39.96-98.04q39.95-39.84 98.16-39.84 58.21 0 98.05 39.96Q618-642.75 618-584.54t-39.96 98.04q-39.95 39.83-98.16 39.83ZM480.31-80q-82.64 0-155.64-31.5-73-31.5-127.34-85.83Q143-251.67 111.5-324.51T80-480.18q0-82.82 31.5-155.49 31.5-72.66 85.83-127Q251.67-817 324.51-848.5T480.18-880q82.82 0 155.49 31.5 72.66 31.5 127 85.83Q817-708.33 848.5-635.65 880-562.96 880-480.31q0 82.64-31.5 155.64-31.5 73-85.83 127.34Q708.33-143 635.65-111.5 562.96-80 480.31-80Zm-.31-66.67q54.33 0 105-15.83t97.67-52.17q-47-33.66-98-51.5Q533.67-284 480-284t-104.67 17.83q-51 17.84-98 51.5 47 36.34 97.67 52.17 50.67 15.83 105 15.83Zm0-366.66q31.33 0 51.33-20t20-51.34q0-31.33-20-51.33T480-656q-31.33 0-51.33 20t-20 51.33q0 31.34 20 51.34 20 20 51.33 20Zm0-71.34Zm0 369.34Z"/></svg>
            <MenuOptionLabel>Profile</MenuOptionLabel>
            </MenuOption>
            </Link>
            <Link to="/proposers" style={{ textDecoration: 'none', color: '#4e4e4e' }}>

            <MenuOption>
            <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#5f6368"><path d="M38.67-160v-100q0-34.67 17.83-63.17T105.33-366q69.34-31.67 129.67-46.17 60.33-14.5 123.67-14.5 63.33 0 123.33 14.5T611.33-366q31 14.33 49.17 42.83T678.67-260v100h-640Zm706.66 0v-102.67q0-56.66-29.5-97.16t-79.16-66.84q63 7.34 118.66 22.5 55.67 15.17 94 35.5 34 19.34 53 46.17 19 26.83 19 59.83V-160h-176ZM358.67-480.67q-66 0-109.67-43.66Q205.33-568 205.33-634T249-743.67q43.67-43.66 109.67-43.66t109.66 43.66Q512-700 512-634t-43.67 109.67q-43.66 43.66-109.66 43.66ZM732-634q0 66-43.67 109.67-43.66 43.66-109.66 43.66-11 0-25.67-1.83-14.67-1.83-25.67-5.5 25-27.33 38.17-64.67Q578.67-590 578.67-634t-13.17-80q-13.17-36-38.17-66 12-3.67 25.67-5.5 13.67-1.83 25.67-1.83 66 0 109.66 43.66Q732-700 732-634ZM105.33-226.67H612V-260q0-14.33-8.17-27.33-8.16-13-20.5-18.67-66-30.33-117-42.17-51-11.83-107.66-11.83-56.67 0-108 11.83-51.34 11.84-117.34 42.17-12.33 5.67-20.16 18.67-7.84 13-7.84 27.33v33.33Zm253.34-320.66q37 0 61.83-24.84Q445.33-597 445.33-634t-24.83-61.83q-24.83-24.84-61.83-24.84t-61.84 24.84Q272-671 272-634t24.83 61.83q24.84 24.84 61.84 24.84Zm0 320.66Zm0-407.33Z"/></svg>
            <MenuOptionLabel>Proposers</MenuOptionLabel>
            </MenuOption>
            </Link>
            <Link to="/proposals" style={{ textDecoration: 'none', color: '#4e4e4e' }}>
            <MenuOption>
            <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#5f6368"><path d="M306.67-284q13.66 0 23.5-9.83 9.83-9.84 9.83-23.5 0-13.67-9.83-23.5-9.84-9.84-23.5-9.84-13.67 0-23.5 9.84-9.84 9.83-9.84 23.5 0 13.66 9.84 23.5Q293-284 306.67-284Zm0-162.67q13.66 0 23.5-9.83Q340-466.33 340-480t-9.83-23.5q-9.84-9.83-23.5-9.83-13.67 0-23.5 9.83-9.84 9.83-9.84 23.5t9.84 23.5q9.83 9.83 23.5 9.83Zm0-162.66q13.66 0 23.5-9.84Q340-629 340-642.67q0-13.66-9.83-23.5-9.84-9.83-23.5-9.83-13.67 0-23.5 9.83-9.84 9.84-9.84 23.5 0 13.67 9.84 23.5 9.83 9.84 23.5 9.84Zm128 325.33h242.66v-66.67H434.67V-284Zm0-162.67h242.66v-66.66H434.67v66.66Zm0-162.66h242.66V-676H434.67v66.67ZM186.67-120q-27 0-46.84-19.83Q120-159.67 120-186.67v-586.66q0-27 19.83-46.84Q159.67-840 186.67-840h586.66q27 0 46.84 19.83Q840-800.33 840-773.33v586.66q0 27-19.83 46.84Q800.33-120 773.33-120H186.67Zm0-66.67h586.66v-586.66H186.67v586.66Zm0-586.66v586.66-586.66Z"/></svg>
            <MenuOptionLabel>Proposals</MenuOptionLabel>
            </MenuOption>
            </Link>
            <Link to="/settings/profile" style={{ textDecoration: 'none', color: '#4e4e4e' }}>
            <MenuOption>
            <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#5f6368"><path d="m382-80-18.67-126.67q-17-6.33-34.83-16.66-17.83-10.34-32.17-21.67L178-192.33 79.33-365l106.34-78.67q-1.67-8.33-2-18.16-.34-9.84-.34-18.17 0-8.33.34-18.17.33-9.83 2-18.16L79.33-595 178-767.67 296.33-715q14.34-11.33 32.34-21.67 18-10.33 34.66-16L382-880h196l18.67 126.67q17 6.33 35.16 16.33 18.17 10 31.84 22L782-767.67 880.67-595l-106.34 77.33q1.67 9 2 18.84.34 9.83.34 18.83 0 9-.34 18.5Q776-452 774-443l106.33 78-98.66 172.67-118-52.67q-14.34 11.33-32 22-17.67 10.67-35 16.33L578-80H382Zm55.33-66.67h85l14-110q32.34-8 60.84-24.5T649-321l103.67 44.33 39.66-70.66L701-415q4.33-16 6.67-32.17Q710-463.33 710-480q0-16.67-2-32.83-2-16.17-7-32.17l91.33-67.67-39.66-70.66L649-638.67q-22.67-25-50.83-41.83-28.17-16.83-61.84-22.83l-13.66-110h-85l-14 110q-33 7.33-61.5 23.83T311-639l-103.67-44.33-39.66 70.66L259-545.33Q254.67-529 252.33-513 250-497 250-480q0 16.67 2.33 32.67 2.34 16 6.67 32.33l-91.33 67.67 39.66 70.66L311-321.33q23.33 23.66 51.83 40.16 28.5 16.5 60.84 24.5l13.66 110Zm43.34-200q55.33 0 94.33-39T614-480q0-55.33-39-94.33t-94.33-39q-55.67 0-94.5 39-38.84 39-38.84 94.33t38.84 94.33q38.83 39 94.5 39ZM480-480Z"/></svg>
            <MenuOptionLabel>Settings</MenuOptionLabel>
            </MenuOption>
            </Link>
          </OptionsMenu>
          </OtherOptions>
        <Column4>
          <Div25>
            <Div32>
              <Div37>Activity</Div37>
              <Div33>
                <Column5 title='Created'>
                    <Div39>{appearances['Sum'] || 0}</Div39>
                    <Div38><svg xmlns="http://www.w3.org/2000/svg" height="42px" viewBox="0 -960 960 960" width="48px" fill="#5f6368"><path d="M453-280h60v-166h167v-60H513v-174h-60v174H280v60h173v166Zm27.27 200q-82.74 0-155.5-31.5Q252-143 197.5-197.5t-86-127.34Q80-397.68 80-480.5t31.5-155.66Q143-709 197.5-763t127.34-85.5Q397.68-880 480.5-880t155.66 31.5Q709-817 763-763t85.5 127Q880-563 880-480.27q0 82.74-31.5 155.5Q817-252 763-197.68q-54 54.31-127 86Q563-80 480.27-80Zm.23-60Q622-140 721-239.5t99-241Q820-622 721.19-721T480-820q-141 0-240.5 98.81T140-480q0 141 99.5 240.5t241 99.5Zm-.5-340Z"/></svg></Div38>
                </Column5>
                <Column5 title='New'>
                    <Div39>{appearances['New'] || 0}</Div39>
                    <Div38><svg xmlns="http://www.w3.org/2000/svg" height="42px" viewBox="0 -960 960 960" width="48px" fill="#434343"><path d="M120-160v-640l760 320-760 320Zm60-93 544-227-544-230v168l242 62-242 60v167Zm0 0v-457 457Z"/></svg></Div38>
                </Column5>
                <Column5 title='Accepted'>
                    <Div39>{appearances['Accepted'] || 0}</Div39>
                    <Div38><svg xmlns="http://www.w3.org/2000/svg" height="42px" viewBox="0 -960 960 960" width="48px" fill="#434343"><path d="M378-246 154-470l43-43 181 181 384-384 43 43-427 427Z"/></svg></Div38>
                </Column5>
                <Column5 title='Declined'>
                    <Div39>{appearances['Declined'] || 0}</Div39>
                    <Div38><svg xmlns="http://www.w3.org/2000/svg" height="42px" viewBox="0 -960 960 960" width="48px" fill="#434343"><path d="m330-288 150-150 150 150 42-42-150-150 150-150-42-42-150 150-150-150-42 42 150 150-150 150 42 42ZM480-80q-82 0-155-31.5t-127.5-86Q143-252 111.5-325T80-480q0-83 31.5-156t86-127Q252-817 325-848.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 82-31.5 155T763-197.5q-54 54.5-127 86T480-80Zm0-60q142 0 241-99.5T820-480q0-142-99-241t-241-99q-141 0-240.5 99T140-480q0 141 99.5 240.5T480-140Zm0-340Z"/></svg></Div38>
                </Column5>
                <Column5 title='Graded'>
                    <Div39>{appearances['Graded'] || 0}</Div39>
                    <Div38><svg xmlns="http://www.w3.org/2000/svg" height="42px" viewBox="0 -960 960 960" width="48px" fill="#434343"><path d="M660-120 555-226l43-42 63 63 138-139 43 42-182 182Zm-540 0v-60h360v60H120Zm0-165v-60h360v60H120Zm0-165v-60h720v60H120Zm0-165v-60h720v60H120Zm0-165v-60h720v60H120Z"/></svg></Div38>
                </Column5>
                <Column5 title='progress'>
                    <Div39>{appearances['In progress'] || 0}</Div39>
                    <Div38><svg xmlns="http://www.w3.org/2000/svg" height="42px" viewBox="0 -960 960 960" width="48px" fill="#434343"><path d="M430-82q-72-9-134.5-43t-108-86.5Q142-264 116-332.5T90-480q0-88 41.5-168T243-790H121v-60h229v229h-60v-129q-64 51-102 121.5T150-480q0 132 80 225.5T430-143v61Zm-7-228L268-465l42-42 113 113 227-227 42 42-269 269Zm187 200v-229h60v129q64-52 102-122t38-148q0-132-80-225.5T530-817v-61q146 18 243 129t97 269q0 88-41.5 168T717-170h122v60H610Z"/></svg></Div38>
                </Column5>
                <Column5 title='Done'>
                    <Div39>{appearances['Done'] || 0}</Div39>
                    <Div38><svg xmlns="http://www.w3.org/2000/svg" height="42px" viewBox="0 -960 960 960" width="48px" fill="#434343"><path d="M294-242 70-466l43-43 181 181 43 43-43 43Zm170 0L240-466l43-43 181 181 384-384 43 43-427 427Zm0-170-43-43 257-257 43 43-257 257Z"/></svg></Div38>
                </Column5>
                <Column5 title='Acrhived'>
                    <Div39>{appearances['Acrhived'] || 0}</Div39>
                    <Div38><svg xmlns="http://www.w3.org/2000/svg" height="42px" viewBox="0 -960 960 960" width="48px" fill="#434343"><path d="m480-270 156-156-40-40-86 86v-201h-60v201l-86-86-40 40 156 156ZM180-674v494h600v-494H180Zm0 554q-24.75 0-42.37-17.63Q120-155.25 120-180v-529q0-9.88 3-19.06 3-9.18 9-16.94l52-71q8-11 20.94-17.5Q217.88-840 232-840h495q14.12 0 27.06 6.5T775-816l53 71q6 7.76 9 16.94 3 9.18 3 19.06v529q0 24.75-17.62 42.37Q804.75-120 780-120H180Zm17-614h565l-36.41-46H233l-36 46Zm283 307Z"/></svg></Div38>
                </Column5>
              </Div33>
              <Div43>
              <Div46>Proposals created for last week:</Div46>
              <LineChart
        xAxis={[
          {
            label: "Date",
            data: xAxisData,
            tickInterval: xAxisData,
            scaleType: "time",
            valueFormatter: (timestamp) => {
              const date = new Date(timestamp);
              return dayjs(date).format("MMM D");
            },
          },
        ]}
        yAxis={[{ label: "Proposals count", 
        style: { marginLeft: '20px' },

      }]}
        series={[
          {label: 'Proposals: ', data: yAxisData },
        ]}
        height={300}
      />
              </Div43>
              <Div45></Div45>
            </Div32>
          </Div25>
        </Column4>
      </Div2>
    </Div>
  );
}

const Div = styled.div`
  background-color: #fff;
  padding: 0 20px 0 50px;
  @media (max-width: 991px) {
    padding: 0 20px;
  }
`;

const Div2 = styled.div`
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
  margin-top:5%;
  @media (max-width: 991px) {
    width: 100%;
  }
`;

const Div3 = styled.div`
  display: flex;
  flex-direction: column;
  @media (max-width: 991px) {
    max-width: 100%;
    margin-top: 40px;
  }
`;

const Div4 = styled.div`
  align-items: center;
  border-radius: 8px;
  box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.2);
  background-color: #fff;
  display: flex;
  padding: 18px 5px 18px 18px;
  @media (max-width: 991px) {
    max-width: 100%;
    flex-wrap: wrap;
    padding-right: 20px;
  }
`;

const Img = styled.img`
  border-radius: 50%;
  aspect-ratio: 1;
  object-fit: auto;
  object-position: center;
`;

const Div5 = styled.div`
  align-self: start;  
  display: flex;
  margin-top: 9px;
  flex-grow: 1;
  flex-basis: 0%;
  flex-direction: column;
`;

const Div15 = styled.div`
  margin-left: 15px;
  display: flex;
  align-items: center;
  color: #4a4a4a;
  font: 1000 22px Roboto, sans-serif;
`;

const Div6 = styled.div`
  margin-left: 15px;
  color: #4a4a4a;
  font: 1000 22px Roboto, sans-serif;
`;

const Div7 = styled.div`
  margin-left: 15px;
  color: #868686;
  margin-top: 10px;
  white-space: nowrap;
  font: italic 300 19px Roboto, sans-serif;
  @media (max-width: 991px) {
    white-space: initial;
  }
`;

const MenuPanel = styled.div`
  border-radius: 8px;
  border: 1px solid #d7d7d7;
  background-color: #fff;
  display: flex;
  height: 25px;
  justify-content: space-between;
  padding: 8px 13px;
  @media (max-width: 991px) {
    white-space: initial;
  }
`;

const OtherOptions = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #fff;
  box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.2);
  margin-right: 30px;
  padding: 40px 18px 0 18px;
  border-radius: 8px;
  @media (max-width: 991px) {
    max-width: 100%;
  }
`;

const OptionsMenu = styled.div`
  display: flex;
  gap: 10px;
  flex-direction: column;
  margin-top: 20px;
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
  font-size: 18px;
  align-items: center;
  gap: 15px;
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
  &:hover::before {
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
const MenuOptionLabel = styled.div`
  white-space: nowrap;
  width: 100%;
`;
const UserInfoImg = styled.img`
  border-radius: 50%;
  aspect-ratio: 1;
  object-fit: auto;
  object-position: center;
  width: 60px;
`;

const UserInfo = styled.div`
  display: flex;
  gap: 20px;
`;

const Divider = styled.div`
  position: relative;
  background-color: #d3d3d3;
  height: 1px;
  margin-top: 20px;
  width: 100%;
  
  @media (max-width: 991px) {
    max-width: 100%;
  }
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

const Div9 = styled.div`
  margin-top: 56px;
  @media (max-width: 991px) {
    max-width: 100%;
    margin-top: 40px;
  }
`;

const MenuPanelText = styled.div`
  font-family: Roboto, sans-serif;
  flex-grow: 1;
  margin: auto 0;
  @media (max-width: 991px) {
    white-space: initial;
  }
`;

const Div10 = styled.div`
  gap: 20px;
  display: flex;
  @media (max-width: 991px) {
    flex-direction: column;
    align-items: stretch;
    gap: 0px;
  }
`;

const Column2 = styled.div`
  display: flex;
  flex-direction: column;
  line-height: normal;
  width: 70%;
  margin-left: 0px;
  @media (max-width: 991px) {
    width: 100%;
  }
`;

const Div11 = styled.div`
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  font-size: 18px;
  color: #000;
  font-weight: 300;
  white-space: nowrap;
  text-align: center;
  @media (max-width: 991px) {
    margin-top: 40px;
    white-space: initial;
  }
`;

const Div12 = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 20px;
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

const Button = styled.button`
  aspect-ratio: 1;
  object-fit: auto;
  border-radius:10%;
  border:none;
  object-position: center;
  width: 120px;
  &:hover {
    transform: translateY(-5px);
    color: #333;
    cursor:pointer;
    box-shadow: .0rem .2rem .4rem #777;
    background-color:#ECF3FF;
    pointer-events: visible;
    position: relative;
    z-index: 0;
    visibility: visible;
    float: none;
}
`;

const Text = styled.div`
  font-family: Roboto, sans-serif;
  margin-top: 19px;
`;



const Div17 = styled.div`
  display: flex;
  margin-top: 35px;
  justify-content: space-between;
  gap: 20px;
  @media (max-width: 991px) {
    white-space: initial;
  }
`;


const Column4 = styled.div`
  display: flex;
  flex-direction: column;
  line-height: normal;
  width: 100%;
  margin-left: 20px;
  @media (max-width: 991px) {
    width: 100%;
  }
`;

const Div25 = styled.div`
  display: flex;
  flex-direction: column;
  @media (max-width: 991px) {
    max-width: 100%;
    margin-top: 40px;
  }
`;

const Div26 = styled.div`
  display: flex;
  position: relative;
  justify-content: center;
  width: 100%;
  font-weight: 400;
  padding: 10px 0;
  white-space: nowrap;
  @media (max-width: 991px) {
    flex-wrap: wrap;
    white-space: initial;
  }
`;

const Div27 = styled.div`
  align-self: center;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  font-size: 30px;
  color: #696969;
  @media (max-width: 991px) {
    white-space: initial;
  }
`;
const DropdownWrapper = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  width: 160px;
  margin-top: 15px;
`;

const Img8 = styled.img`
  aspect-ratio: 1.12;
  object-fit: auto;
  object-position: center;
  width: 53px;
`;

const Img9 = styled.img`
  aspect-ratio: 1;
  border-radius: 50%;
  object-fit: auto;
  object-position: center;
  width: 24px;
`;

const Div28 = styled.div`
  font-family: Roboto, sans-serif;
  align-self: center;
`;

const Div29 = styled.div`
  border-radius: 8px;
  border: 1px solid #d7d7d7;
  background-color: #fff;
  align-self: start;
  display: flex;
  justify-content: space-between;
  gap: 20px;
  font-size: 16px;
  color: #000;
  padding: 8px 13px;
  @media (max-width: 991px) {
    white-space: initial;
  }
`;

const DropdownMenu = styled.div`
  width: 160px;
  position: absolute;
  top: 41px;
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

const TextWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
  @media (max-width: 991px) {
    white-space: initial;
  }
`;
const ProfileText = styled.div`
  font-family: Roboto, sans-serif;
  flex-grow: 1;
  margin: auto 0;
  @media (max-width: 991px) {
    white-space: initial;
  }
`;
const LogoutText = styled.div`
  font-family: Roboto, sans-serif;
  flex-grow: 1;
  margin: auto 0;
  @media (max-width: 991px) {
    white-space: initial;
  }
`;
const Div30 = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
  @media (max-width: 991px) {
    white-space: initial;
  }
`;

const RightMenuBar = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
  @media (max-width: 991px) {
    white-space: initial;
  }
`;

const ProfileName = styled.div`
  font-family: Roboto, sans-serif;
  flex-grow: 1;
  margin: auto 0;
  @media (max-width: 991px) {
    white-space: initial;
  }
`;

const Div32 = styled.div`
  border-radius: 8px;
  box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.2);
  background-color: #fff;
  display: flex;
  flex-direction: column;
  padding: 30px 18px 0 18px;
  @media (max-width: 991px) {
    max-width: 100%;
    padding-right: 20px;
  }
`;

const Div33 = styled.div`
  display: flex;
  margin-top: 40px;
  justify-content: space-around;
  @media (max-width: 991px) {
    max-width: 100%;
    flex-wrap: wrap;
    padding-right: 20px;
  }
`;

const Column5 = styled.div`
  display: flex;
  flex-direction: column;
  line-height: normal;
  margin-left: 0px;
  @media (max-width: 991px) {
    width: 100%;
  }
`;

const Div36 = styled.div`
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  font-size: 16px;
  color: #484848;
  font-weight: 500;
  @media (max-width: 991px) {
    margin-top: 40px;
  }
`;

const Div37 = styled.div`
  display: flex;
  justify-content: center;
  font: 500 32px Roboto, sans-serif;
  white-space: pre;
  @media (max-width: 991px) {
    white-space: initial;
  }
`;

const Div38 = styled.div`
  display: flex;
  justify-content: center;
  font: 600 16px Roboto, sans-serif;
  font-family: Roboto, sans-serif;
  margin-top: 15px;
  @media (max-width: 991px) {
    margin-top: 40px;
  }
`;

const Div39 = styled.div`
  display: flex;
  justify-content: center;
  font: 400 28px Roboto, sans-serif;
`;

const EditButton = styled.button`
  display: inline-block;
  margin-bottom: 15px;
  background-color: transparent;
  border: none;
  cursor: pointer;
`;





const Div43 = styled.div`
  flex-direction: column;
  @media (max-width: 991px) {
  }
`;

const Div45 = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 21px;
  font: 400 32px Roboto, sans-serif;
`;

const Div46 = styled.div`
  color: #484848;
  margin-top: 50px;
  margin-bottom: 20px;
  margin-left: 25px;
  font: 600 16px Roboto, sans-serif;
  @media (max-width: 991px) {
    max-width: 100%;
    margin-top: 40px;
  }
`;

export default ProposerMainPage;