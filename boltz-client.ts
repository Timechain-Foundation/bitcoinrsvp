import { crypto } from "liquidjs-lib";
const BOLTZ_API_URL = process.env.BOLTZ_API_URL; 

let BOLTZ_ERR = {
    INVOICE_EXISTS: "invoice with payment hash already exists",
  };

export default class BoltzClient {
    static async getInvoice(preimage, hexPublicKey, amountSats) {
        let payload = {
            type: "reversesubmarine",
            pairId: "L-BTC/BTC",
            orderSide: "buy",
            preimageHash: crypto.sha256(preimage).toString("hex"),
            onchainAmount: amountSats,
            claimPublicKey: hexPublicKey,
          };

          let response = await fetch(`${BOLTZ_API_URL}/api/createswap`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });
        
          let reverseSubmarineSwapResponse;
          try {
            reverseSubmarineSwapResponse = await response.json();
          } catch (e) {
            reverseSubmarineSwapResponse = await response.text();
            console.log(reverseSubmarineSwapResponse);
            return;
          }
        
          if (!reverseSubmarineSwapResponse) {
            throw new Error(
              `No response found for call to ${BOLTZ_API_URL} with payload ${JSON.stringify(
                payload
              )}`
            );
          }
        
          if (reverseSubmarineSwapResponse.error) {
            let { error } = reverseSubmarineSwapResponse;
            console.log(error);
        
            if (error == BOLTZ_ERR.INVOICE_EXISTS) {
              return JSON.parse(localStorage.getItem("reverseSubmarineSwapResponse"));
            }
            return;
          }
    
          return reverseSubmarineSwapResponse;
    }
}