/**
 * QR Code generation utilities for booking access
 */

export interface QRCodeData {
  bookingId: string;
  spotId: string;
  location?: string;
  timestamp: number;
  type: "parking_access";
  signature?: string; // Optional cryptographic signature
}

/**
 * Generate QR code data string for booking
 */
export function generateBookingQRData(
  bookingId: string,
  spotId: string,
  location?: string
): string {
  const data: QRCodeData = {
    bookingId,
    spotId,
    location,
    timestamp: Date.now(),
    type: "parking_access",
  };

  return JSON.stringify(data);
}

/**
 * Parse QR code data string
 */
export function parseBookingQRData(qrString: string): QRCodeData | null {
  try {
    const data = JSON.parse(qrString);
    
    // Validate required fields
    if (!data.bookingId || !data.spotId || !data.type) {
      return null;
    }

    return data as QRCodeData;
  } catch (error) {
    return null;
  }
}

/**
 * Validate QR code data (check expiration, signature, etc.)
 */
export function validateQRCodeData(qrData: QRCodeData, maxAgeHours: number = 48): boolean {
  // Check timestamp
  const age = Date.now() - qrData.timestamp;
  const maxAge = maxAgeHours * 60 * 60 * 1000;
  
  if (age > maxAge) {
    return false; // QR code expired
  }

  // Additional validation can be added here
  // e.g., signature verification, booking status check, etc.

  return true;
}

