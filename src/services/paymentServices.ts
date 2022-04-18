import * as businessRepository from "../repositories/businessRepository.js";

export default async function verifyBusiness(businessId: number, cardType: string) {
  const business = await businessRepository.findById(businessId);
  
  if(!business) throw { type: 'Not found', message: 'This company is not registered' };  
  if(business.type !== cardType) throw { type: 'Unauthorized', message: 'The purchase was not authorized, the card type is different from the business type' };
  
  return business;
}