import * as employeeRepository from "../repositories/employeeRepository.js";
import * as cardRepository from "../repositories/cardRepository.js";
import * as paymentRepository from "../repositories/paymentRepository.js";
import * as rechargeRepository from "../repositories/rechargeRepository.js";
import { faker } from "@faker-js/faker";
import dayjs from "dayjs";
import bcrypt from "bcrypt";

export function verifyCardType(cardType: string){  
  const Types = ['groceries', 'restaurants', 'transport', 'education', 'health'];

  const findType = Types.filter((data) => data === cardType);

  if(findType.length === 0) throw { type: 'not found', message: 'Card type does not exist'};
  
}

export async function createNewCard(employee: any, cardType: cardRepository.TransactionTypes){   
  await findCard(cardType, employee.id);

  const number = await generateCardNumber();
  
  const cardholderName = generateCardholderName(employee.fullName);

  const expirationDate = generateExpirationDate();

  const securityCode = generateSecurityCode();

  const CVC = securityCode;
  
  const cardDate = {
    employeeId: employee.id,
    number,
    cardholderName,
    securityCode: bcrypt.hashSync(securityCode, 5),
    expirationDate,
    password: undefined,
    isVirtual: false,
    originalCardId: undefined,
    isBlocked: true,
    type: cardType
  };
  console.log(cardDate);
  
  await cardRepository.insert(cardDate);
  delete cardDate.securityCode;
  return {
    ...cardDate,
    CVC
  };

}

export async function createNewCardOnline(card: cardRepository.Card){ 
  await findOnlineCard(card.employeeId);

  const number = await generateCardNumber();

  const expirationDate = generateExpirationDate();

  const securityCode = generateSecurityCode();

  const CVC = securityCode;
  
  const cardDate = {
    employeeId: card.employeeId,
    number,
    cardholderName: card.cardholderName,
    securityCode: bcrypt.hashSync(securityCode, 5),
    expirationDate,
    password: card.password,
    isVirtual: true,
    originalCardId: card.id,
    isBlocked: true,
    type: card.type
  };
  
  await cardRepository.insert(cardDate);
  delete cardDate.securityCode;
  return {
    ...cardDate,
    CVC
  };

}

export async function verifyEmployeeCompany(employeeId: number, companyId: number) {
  const employee = await employeeRepository.findById(employeeId);
  if(!employee) throw { type: 'not found', message: 'Employee not found' };
  if(employee.companyId !== companyId) throw { type: 'Bad request', message: 'The employee does not work for this company' };

  return employee;
}

export async function verifyCardCVC(employeeId: number, cardId: number, CVC: string) {
  const card = await verifyCard(cardId);

  if(card.password) throw { type: 'Bad request', message: 'The card has already been activated' };
  if(!(bcrypt.compareSync(CVC, card.securityCode))) throw { type: 'Unauthorized', message: 'The security code is wrong' };
  if(card.employeeId !== employeeId) throw { type: 'Unauthorized', message: 'This employee does not have access to this feature' };

  return card;
}

export async function verifyCardForOnlinePayment(
  number: string, 
  cardholderName: string,
  expirationDate: string,
  CVC: string) {
  const card = await cardRepository.findByCardDetails(
    number,
    cardholderName,
    expirationDate
  );
  
  if(!card) throw { type: 'Not found', message: 'The card was not found' };
  if (!(bcrypt.compareSync(CVC, card.securityCode))) throw { type: 'Unauthorized', message: 'The CVC is wrong' };
  if(dayjs().format('MM/YYYY') > card.expirationDate) throw { type: 'Bad request', message: 'The card is expired' };
  if (card.isBlocked) throw { type: 'Unauthorized', message: 'The card is blocked' };

  return card;
}

export async function verifyCard(cardId: number) {
  const card = await cardRepository.findById(cardId);
  
  if(!card) throw { type: 'Not found', message: 'The card was not found' };
  if(dayjs().format('MM/YYYY') > card.expirationDate) throw { type: 'Bad request', message: 'The card is expired' };

  return card;
}

export async function verifyCardForBlocking(cardId: number, password: string) {
  const card = await verifyCard(cardId);
  if (card.isBlocked) throw { type: 'Bad request', message: 'The card is already blocked' };
  if(!(bcrypt.compareSync(password, card.password))) throw { type: 'Unauthorized', message: 'The password is wrong' };
}

export async function verifyCardForUnblocking(cardId: number, password: string) {
  const card = await verifyCard(cardId);
  if (!card.isBlocked) throw { type: 'Bad request', message: 'The card is already unblocked' };
  if(!(bcrypt.compareSync(password, card.password))) throw { type: 'Unauthorized', message: 'The password is wrong' };
}

export async function blockCard(cardId: number) {
  await cardRepository.update(cardId, 
    {
      isBlocked: true
    }); 
}

export async function unblockCard(cardId: number) {
  await cardRepository.update(cardId, 
    {
      isBlocked: false
    }); 
}
export function validatePassword(password: string){
  if(password.length !== 4) throw { type: 'Bad request', message: 'Password does not have four digits' };
}

export async function activateCardEmployee(cardId: number, password: string) {
  const hashPassword = bcrypt.hashSync(`${password}`, 5);
  await cardRepository.update(cardId, 
    {
      password: hashPassword,
      isBlocked: false
    });
}

export async function verifyPassword(cardId: number, password: string) {
  const card = await cardRepository.findById(cardId);

  if(!(bcrypt.compareSync(password, card.password))) throw { type: 'Unauthorized', message: 'The password is wrong' };

  return card;
}

export async function verifyCardForPayment(id: number, password: string) {
  const card = await verifyCard(id);
  
  if (card.isBlocked) throw { type: 'Unauthorized', message: 'The card is blocked' };
  if(!(bcrypt.compareSync(password, card.password))) throw { type: 'Unauthorized', message: 'The password is wrong' };

  return card;
}

export async function balanceCard(cardId: number) {
  const payments = await paymentRepository.findByCardId(cardId);
  const recharges = await rechargeRepository.findByCardId(cardId);
  
  const balance = sumAmounts(payments, recharges);

  return {
    balance,
    transactions: payments,
    recharges
  };
}

function sumAmounts(payments: paymentRepository.PaymentWithBusinessName[], recharges: rechargeRepository.Recharge[]){
  const paymentsAmount = payments.map((data)=> data.amount);
  const rechargesAmount = recharges.map((data)=> data.amount);

  const paymentsTotal = paymentsAmount.reduce(
    (paymentsTotal, amount) => paymentsTotal + amount
    , 0);
  const rechargesTotal = rechargesAmount.reduce(
    (rechargesTotal, amount) => rechargesTotal + amount
    , 0);

  return rechargesTotal - paymentsTotal;
}

async function generateCardNumber(){
  let status = true;
  const cards = await cardRepository.find();
  let number = faker.finance.creditCardNumber('mastercard');
  let findNumberCard = [];
  while (status) {
    findNumberCard = cards.filter((data) => data.number === number);
    if (findNumberCard.length === 0) {
      status = false;
    } else {
      number = faker.finance.creditCardNumber('mastercard');
    }
  }
  
  return `${number}`;
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
  const CVC = faker.finance.creditCardCVV();  
  return `${CVC}`;
}
async function findCard(cardType: cardRepository.TransactionTypes, employeeId: number) {
  const card = await cardRepository.findByTypeAndEmployeeId( cardType, employeeId);
  if(card) throw { type: 'Conflict', message: 'The employee already has a card' };
}
async function findOnlineCard(employeeId: number){
  const findCard = (await cardRepository.find()).filter((data) => 
  data.employeeId === employeeId && data.isVirtual
  );
  if(findCard.length !== 0) throw { type: 'Conflict', message: 'The employee already has a online card' };
}