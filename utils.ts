/**
 * Masks a phone number, showing only the first six digits and the last three digits.
 * Example: 256709419257 -> 256709***257
 */
export const maskPhoneNumber = (phone: any): string => {
    const phoneStr = typeof phone === 'string' ? phone : String(phone || '');
    if (!phoneStr || phoneStr.length < 9) return phoneStr;
    const firstSix = phoneStr.substring(0, 6);
    const lastThree = phoneStr.substring(phoneStr.length - 3);
    const maskedPart = '*'.repeat(phoneStr.length - 9);
    return `${firstSix}${maskedPart}${lastThree}`;
};

/**
 * Formats a date string to DD-MM-YYYY format.
 */
export const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
};
