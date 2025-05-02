export interface UserInfo {
    firstName: string;
    lastName: string;
    email: string;
    title: string;
    company: string;
    phone: string;
  }
  
  export const generateCardData = (userInfo: UserInfo) => {
    return {
      name: `${userInfo.firstName} ${userInfo.lastName}`,
      email: userInfo.email,
      title: userInfo.title,
      company: userInfo.company,
      phone: userInfo.phone,
    };
  };
  