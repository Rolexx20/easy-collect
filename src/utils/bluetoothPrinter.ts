// Bluetooth printer utility for printing receipts
export interface ReceiptData {
  loanNumber: string;
  customerName: string;
  loanAmount: number;
  paymentAmount: number;
  totalPaid: number;
  totalDue: number;
  closingBalance: number;
  date: string;
  route?: string;
}

export class BluetoothPrinter {
  private device: BluetoothDevice | null = null;
  private characteristic: BluetoothRemoteGATTCharacteristic | null = null;

  async connect(): Promise<boolean> {
    // NOTE: Web Bluetooth API only works on HTTPS or localhost.
    // If accessed over a network (not localhost), the site must be served via HTTPS.
    try {
      if (!navigator.bluetooth) {
        console.error('Bluetooth API is not supported in this environment');
        return false;
      }

      console.log("Requesting Bluetooth device...");
      // Prompt user for permission to access Bluetooth devices
      this.device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true, // Allow all Bluetooth devices
      });

      if (!this.device.gatt) {
        throw new Error('GATT not available');
      }

      console.log("Connecting to GATT server...");
      const server = await this.device.gatt.connect();

      console.log("Getting primary service...");
      const service = await server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');

      console.log("Getting characteristic...");
      this.characteristic = await service.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb');

      console.log("Bluetooth device connected successfully!");
      return true;
    } catch (error) {
      if (error.name === 'NotFoundError') {
        console.error('No Bluetooth devices found or permission denied. Please ensure Bluetooth is enabled and grant access.');
      } else {
        console.error('Bluetooth connection failed:', error.message || error);
      }
      return false;
    }
  }

  async printReceipt(data: ReceiptData): Promise<boolean> {
    if (!this.characteristic) {
      console.error('Printer not connected');
      return false;
    }

    try {
      const receipt = this.generateReceiptContent(data);
      const encoder = new TextEncoder();
      const receiptData = encoder.encode(receipt);

      // Split data into chunks if needed (some printers have size limits)
      const chunkSize = 20;
      for (let i = 0; i < receiptData.length; i += chunkSize) {
        const chunk = receiptData.slice(i, i + chunkSize);
        await this.characteristic.writeValue(chunk);
        await new Promise(resolve => setTimeout(resolve, 50)); // Small delay between chunks
      }

      return true;
    } catch (error) {
      console.error('Print failed:', error);
      return false;
    }
  }

  private generateReceiptContent(data: ReceiptData): string {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0];

    return `
Installment Receipt
Tel :
Bill Date : ${date} ${time}

Customer : ${data.customerName}
Loan Amount : ${data.loanAmount.toLocaleString()}
Rental : ${(data.loanAmount / 60).toFixed(0)}
Duration : 60
Start Date : ${data.date}
End Date : ${this.calculateEndDate(data.date)}

Total Paid : ${data.totalPaid.toLocaleString()}
Total Due : ${data.totalDue.toLocaleString()}
Today Paid : ${data.paymentAmount.toLocaleString()}
Brought Forward : ${(data.totalPaid - data.paymentAmount).toLocaleString()}
Arrears : 0
Closing Balance : ${data.closingBalance.toLocaleString()}

--------------------------------
        Thank You!
--------------------------------

`;
  }

  private calculateEndDate(startDate: string): string {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 2); // 60 days ≈ 2 months
    return end.toISOString().split('T')[0];
  }

  disconnect(): void {
    if (this.device && this.device.gatt?.connected) {
      this.device.gatt.disconnect();
    }
    this.device = null;
    this.characteristic = null;
  }
}

export const bluetoothPrinter = new BluetoothPrinter();
