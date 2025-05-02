// utils/generateCard.ts

import { slugify } from "./slugify";

export interface UserInfo {
  firstName: string;
  lastName: string;
  email: string;
  title: string;
  company: string;
  phone: string;
}

export interface CardData {
  name: string;
  email: string;
  title: string;
  company: string;
  phone: string;
  cardUrl: string;
}

export const generateCard = (userInfo: UserInfo): CardData => {
  const fullName = `${userInfo.firstName} ${userInfo.lastName}`;
  const slug = slugify(fullName);

  const cardUrl = `/card/${slug}`;

  return {
    name: fullName,
    email: userInfo.email,
    title: userInfo.title,
    company: userInfo.company,
    phone: userInfo.phone,
    cardUrl,
  };
};
