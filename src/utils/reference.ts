import { v4 as uuidv4 } from 'uuid';

export const generateReference = (): string => {
  return `TXN-${uuidv4()}`;
};