import axios from "axios";
import crypto from "crypto";

const DIGIFLAZZ_USERNAME = process.env.DIGIFLAZZ_USERNAME || "";
const DIGIFLAZZ_API_KEY = process.env.DIGIFLAZZ_API_KEY || "";
const IS_DEV = process.env.DIGIFLAZZ_MODE === "dev";

const BASE_URL = "https://api.digiflazz.com/v1";

/**
 * Generate Digiflazz signature
 * Formula: md5(username + apiKey + refId)
 */
function generateSignature(refId: string): string {
    return crypto
        .createHash("md5")
        .update(DIGIFLAZZ_USERNAME + DIGIFLAZZ_API_KEY + refId)
        .digest("hex");
}

export const digiflazz = {
    /**
     * Get Digiflazz Account Balance
     */
    async getBalance() {
        try {
            const signature = generateSignature("depo");
            const res = await axios.post(`${BASE_URL}/cek-saldo`, {
                cmd: "deposit",
                username: DIGIFLAZZ_USERNAME,
                sign: signature,
            });
            return res.data.data;
        } catch (error) {
            console.error("Digiflazz Balance Error:", error);
            throw error;
        }
    },

    /**
     * Get Price List (Pricelist)
     */
    async getPricelist(code?: string) {
        try {
            const signature = generateSignature("pricelist");
            const res = await axios.post(`${BASE_URL}/price-list`, {
                cmd: "prepaid",
                username: DIGIFLAZZ_USERNAME,
                sign: signature,
                ...(code && { code }),
            });
            return res.data.data;
        } catch (error) {
            console.error("Digiflazz Pricelist Error:", error);
            throw error;
        }
    },

    /**
     * Process Top-up Transaction
     * @param sku - Stock Keeping Unit (Product Code)
     * @param customerNo - Target ID/Number (e.g. User ID)
     * @param refId - Unique Order ID from our system
     */
    async topup(sku: string, customerNo: string, refId: string) {
        try {
            const signature = generateSignature(refId);
            const res = await axios.post(`${BASE_URL}/transaction`, {
                username: DIGIFLAZZ_USERNAME,
                buyer_sku_code: sku,
                customer_no: customerNo,
                ref_id: refId,
                sign: signature,
                // Optional: testing on dev mode
                ...(IS_DEV && { testing: true })
            });
            return res.data.data;
        } catch (error) {
            console.error("Digiflazz Transaction Error:", error);
            throw error;
        }
    },

    /**
     * Check Transaction Status
     */
    async checkStatus(sku: string, customerNo: string, refId: string) {
        try {
            const signature = generateSignature(refId);
            const res = await axios.post(`${BASE_URL}/transaction`, {
                username: DIGIFLAZZ_USERNAME,
                buyer_sku_code: sku,
                customer_no: customerNo,
                ref_id: refId,
                sign: signature,
            });
            return res.data.data;
        } catch (error) {
            console.error("Digiflazz Status Check Error:", error);
            throw error;
        }
    }
};
