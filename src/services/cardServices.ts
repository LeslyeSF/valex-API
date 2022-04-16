import * as employeeRepository from "../repositories/employeeRepository.js";
import * as cardRepository from "../repositories/cardRepository.js";
import { faker } from "@faker-js/faker";
import dayjs from "dayjs";
import bcrypt from "bcrypt";

export function verifyCardType(cardType: string){
  const Types = ['groceries', 'restaurants', 'transport', 'education', 'health'];

  const findType = Types.filter((data) => data === cardType);

  if(findType.length === 0){
    throw { type: 'not found', message: 'Card type does not exist'};
  }
}

export async function createNewCard(employeeId: number, cardType: cardRepository.TransactionTypes, companyId: number){

  const employee = await employeeRepository.findById(employeeId);
  if(!employee) throw { type: 'not found', message: 'Employee not found' };
  if(employee.companyId !== companyId) throw { type: 'Bad request', message: 'The employee does not work for this company' };

  const findCard = await cardRepository.findByTypeAndEmployeeId( cardType, employeeId );
  if(findCard) throw { type: 'Conflict', message: 'The employee already has a card' };
  
  
  const number = faker.finance.creditCardNumber('mastercard');
  //verificar se ja existe

  const cardholderName = generateCardholderName(employee.fullName);

  const expirationDate = generateExpirationDate();

  const securityCode = generateSecurityCode();

  const cardDate = {
    employeeId,
    number,
    cardholderName,
    securityCode,
    expirationDate,
    password: undefined,
    isVirtual: false,
    originalCardId: undefined,
    isBlocked: true,
    type: cardType
  };

  await cardRepository.insert(cardDate);

}

export async function activateCard() {
  
}

function generateCardholderName(name: string): string {
  let employeeName: string[] = name.split(" ");
  
  
  let lengthName = employeeName.length;

  employeeName = employeeName.filter((date, index) => date.length >= 3 || (index == 0 || index == (lengthName - 1)));
  lengthName = employeeName.length;

  employeeName = employeeName.map((data, index) => {
    if (index > 0 && index < (lengthName-1)){
      return data[0];
    } else {
      return data;
    }
  });

  employeeName = employeeName.map((data) => data.toUpperCase());

  return employeeName.join(" ");
}

function generateExpirationDate(): string {
  return `${dayjs().add(5, 'year').format('MM/YYYY')}`;
}

function generateSecurityCode(): string{
  return `${bcrypt.hashSync(faker.finance.creditCardCVV(), 5)}`;
}