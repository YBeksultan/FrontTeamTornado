import React, { useState, useEffect } from 'react';
import styled from "styled-components";
import { Link } from 'react-router-dom';
import { LineChart } from '@mui/x-charts';
import Spinner from '../spinner/spinner';
import { getImageById, fetchUserData, fetchProposalCountData, fetchProposalCountDataByDays } from '../../services/apiService';
import Avatar from '../../images/User-512.webp';
import dayjs from "dayjs";
import '../CSS/style.css'; 

export const logOut = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('userRole');
  window.location.href = "../login";
};



function MainPage(props) {
  const [userData, setUserData] = useState(null);
  const [proposalData, setProposalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [proposalDataByDays, setProposalDataByDays] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [userRole, setUserRole] = useState(null);

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
    const storedUserRole = localStorage.getItem('userRole');
    if (storedUserRole) {
      setUserRole(storedUserRole);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userDataResponse = await fetchUserData();
        const proposalDataResponse = await fetchProposalCountData();
        const proposalDataByDaysResponse = await fetchProposalCountDataByDays();
        setProposalData(proposalDataResponse);

        if (userDataResponse) {
          if(userDataResponse.avatar){
            const imageResponse = await getImageById(userDataResponse.avatar);
            setImageSrc(imageResponse.image);
          }
          setUserData(userDataResponse);
        }

        setProposalDataByDays(proposalDataByDaysResponse);
        setLoading(false);
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
            <UserName>{userData.first_name || ""}</UserName>
            <UserRole>
                {userRole}
            </UserRole>
          </UserNameAndRole>
          </UserInfo>

          <Divider />
          <OptionsMenu>
            <Link to="/slider" style={{ textDecoration: 'none', color: '#4e4e4e' }}>
            <MenuOption>
            <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#5f6368"><path d="M186.67-120q-27.5 0-47.09-19.58Q120-159.17 120-186.67v-426.66q0-27.5 19.58-47.09Q159.17-680 186.67-680H380v66.67H186.67v426.66h586.66v-426.66H580V-680h193.33q27.5 0 47.09 19.58Q840-640.83 840-613.33v426.66q0 27.5-19.58 47.09Q800.83-120 773.33-120H186.67ZM480-322 318.67-483.33 366-530.67l80.67 80.34V-960h66.66v509.67L594-530.67l47.33 47.34L480-322Z"/></svg>
            <MenuOptionLabel>Slider</MenuOptionLabel>
            </MenuOption>
            </Link>
            <Link to="/grading" style={{ textDecoration: 'none', color: '#4e4e4e' }}>
            <MenuOption>
            <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#5f6368"><path d="M333.33-259 480-347l146.67 89-39-166.67 129-112-170-15L480-709l-66.67 156.33-170 15 129 112.34-39 166.33ZM233-120l65-281L80-590l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Zm247-353.33Z"/></svg>
            <MenuOptionLabel>Grading</MenuOptionLabel>
            </MenuOption>
            </Link>
            <Link to="/after_grading" style={{ textDecoration: 'none', color: '#4e4e4e' }}>
            <MenuOption>
            <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#5f6368"><path d="M141.33-120q-27 0-46.83-19.83-19.83-19.84-19.83-46.84v-586.66q0-27 19.83-46.84Q114.33-840 141.33-840h677.34q27 0 46.83 19.83 19.83 19.84 19.83 46.84v586.66q0 27-19.83 46.84Q845.67-120 818.67-120H141.33Zm0-66.67h677.34v-586.66H141.33v586.66ZM200-280h200v-80H200v80Zm382-80 198-198-57-57-141 142-57-57-56 57 113 113Zm-382-80h200v-80H200v80Zm0-160h200v-80H200v80Zm-58.67 413.33v-586.66 586.66Z"/></svg>
            <MenuOptionLabel>After Grading</MenuOptionLabel>
            </MenuOption>
            </Link>
            <Link to="/assigned" style={{ textDecoration: 'none', color: '#4e4e4e' }}>
            <MenuOption>
            <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#5f6368"><path d="M423.33-325.33 702-604l-47.33-47.33L423.33-420 304.67-538.67 258-492l165.33 166.67ZM186.67-120q-27.5 0-47.09-19.58Q120-159.17 120-186.67v-586.66q0-27.5 19.58-47.09Q159.17-840 186.67-840h192.66q7.67-35.33 35.84-57.67Q443.33-920 480-920t64.83 22.33Q573-875.33 580.67-840h192.66q27.5 0 47.09 19.58Q840-800.83 840-773.33v586.66q0 27.5-19.58 47.09Q800.83-120 773.33-120H186.67Zm0-66.67h586.66v-586.66H186.67v586.66Zm293.33-608q13.67 0 23.5-9.83t9.83-23.5q0-13.67-9.83-23.5t-23.5-9.83q-13.67 0-23.5 9.83t-9.83 23.5q0 13.67 9.83 23.5t23.5 9.83Zm-293.33 608v-586.66 586.66Z"/></svg>
            <MenuOptionLabel>Assigned</MenuOptionLabel>
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
              <Div37>General information about the activity</Div37>
              <Div33>
                <Column5>
                    <Div38>Proposals received</Div38>
                    <Div39>{proposalData.proposal_count}</Div39>
                </Column5>
                <Column5>
                    <Div38>Active users</Div38>
                    <Div39>{proposalData.active_user_count}</Div39>
                </Column5>
                <Column5>
                    <Div38>Registered users</Div38>
                    <Div39>{proposalData.user_count}</Div39>
                </Column5>
              </Div33>
              <Div43>
              <Div46>Proposals received:</Div46>
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

      }]}
        series={[
          {label: 'Proposals: ', data: yAxisData },
        ]}
        height={300}
      />
              </Div43>
            </Div32>
          </Div25>
        </Column4>
      </Div2>
    </Div>
  );
}



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
  width: 85px;
  height: 85px;
`;

const Div5 = styled.div`
  align-self: start;  
  display: flex;
  margin-top: 9px;
  flex-grow: 1;
  flex-basis: 0%;
  flex-direction: column;
`;

const Div6 = styled.div`
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

const Div8 = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
  @media (max-width: 991px) {
    white-space: initial;
  }
`;

const Div9 = styled.div`
  margin-top: 56px;
  @media (max-width: 991px) {
    max-width: 100%;
    margin-top: 40px;
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
  width: 73%;
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
const MenuPanelText = styled.div`
  font-family: Roboto, sans-serif;
  flex-grow: 1;
  margin: auto 0;
  @media (max-width: 991px) {
    white-space: initial;
  }
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
  top: 40px;
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

const ProfileImage = styled.img`
  border-radius: 50%;
  aspect-ratio: 1;
  object-fit: auto;
  object-position: center;
  width: 24px;
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
  justify-content: space-between;
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
  width: 80%;
  margin-left: 0px;
  @media (max-width: 991px) {
    width: 100%;
  }
`;

const Div37 = styled.div`
  display: flex;
  justify-content: center;
  font: 500 28px Roboto, sans-serif;
  white-space: pre;
  @media (max-width: 991px) {
    white-space: initial;
  }
`;

const Div38 = styled.div`
  display: flex;
  justify-content: center;
  font: 600 15px Roboto, sans-serif;
  font-family: Roboto, sans-serif;
  margin-top: 49px;
  @media (max-width: 991px) {
    margin-top: 40px;
  }
`;

const Div39 = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 21px;
  font: 400 24px Roboto, sans-serif;
`;

const Div43 = styled.div`
  flex-direction: column;
  @media (max-width: 991px) {
  }
`;

const Div44 = styled.div`
  font: 600 16px Roboto, sans-serif;
  @media (max-width: 991px) {
    white-space: initial;
  }
`;

const Div45 = styled.div`
  margin-top: 21px;
  font: 400 32px Roboto, sans-serif;
`;

const Div46 = styled.div`
  color: #484848;
  margin-top: 93px;
  font: 600 16px Roboto, sans-serif;
  @media (max-width: 991px) {
    max-width: 100%;
    margin-top: 40px;
  }
`;

export default MainPage;