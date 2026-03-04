"use client";

interface BookingReceiptProps {
  booking: {
    id: string;
    spotLocation: string;
    date: string;
    startTime: string;
    endTime: string;
    duration: number;
    subtotal: string;
    serviceFee: string;
    total: string;
    transactionHash?: string;
  };
}

export default function BookingReceipt({ booking }: BookingReceiptProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Booking Receipt</h2>
        <p className="text-gray-600">CarIn Parking Booking</p>
      </div>

      <div className="space-y-4 mb-8">
        <div className="flex justify-between py-2 border-b">
          <span className="text-gray-600">Booking ID:</span>
          <span className="font-medium">{booking.id}</span>
        </div>
        <div className="flex justify-between py-2 border-b">
          <span className="text-gray-600">Location:</span>
          <span className="font-medium">{booking.spotLocation}</span>
        </div>
        <div className="flex justify-between py-2 border-b">
          <span className="text-gray-600">Date:</span>
          <span className="font-medium">{new Date(booking.date).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between py-2 border-b">
          <span className="text-gray-600">Time:</span>
          <span className="font-medium">{booking.startTime} - {booking.endTime}</span>
        </div>
        <div className="flex justify-between py-2 border-b">
          <span className="text-gray-600">Duration:</span>
          <span className="font-medium">{booking.duration} hour(s)</span>
        </div>
        <div className="flex justify-between py-4 border-b border-white/5">
          <span className="text-gray-400 font-medium">Subtotal:</span>
          <span className="font-bold text-white">{booking.subtotal} STX</span>
        </div>
        <div className="flex justify-between py-4 border-b border-white/5">
          <span className="text-gray-400 font-medium">Service Fee:</span>
          <span className="font-bold text-white">{booking.serviceFee} STX</span>
        </div>
        <div className="flex justify-between py-6 border-t-2 border-indigo-500/20 mt-4">
          <span className="text-xl font-bold text-white">Total:</span>
          <span className="text-2xl font-black text-indigo-400">{booking.total} STX</span>
        </div>
        {booking.transactionHash && (
          <div className="flex justify-between py-2 border-t pt-4">
            <span className="text-gray-600">Transaction:</span>
            <a
              href={`https://explorer.hiro.so/txid/${booking.transactionHash}?chain=testnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 text-sm font-bold tracking-tighter"
            >
              {booking.transactionHash.slice(0, 10)}...{booking.transactionHash.slice(-6)}
            </a>
          </div>
        )}
      </div>

      <div className="text-center">
        <button
          onClick={handlePrint}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Print Receipt
        </button>
      </div>
    </div>
  );
}




