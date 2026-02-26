import axios from 'axios';

class AdjutorService {
    private baseUrl = process.env.ADJUTOR_BASE_URL;
    private apiKey = process.env.ADJUTOR_API_KEY;

    private get headers() {
        return {
            Authorization: `Bearer ${this.apiKey}`,
        };
    }

    async checkKarmaBlacklist(email: string): Promise<boolean> {
        try {
         const response = await axios.get(`${this.baseUrl}/verification/karma/${email}`, { headers: this.headers});
         return response.data?.data !== null;
        } catch (error: any) {
            if(error.response?.status === 404) return false;
            throw new Error('Karma check failed, please try again')            
        }
    }
}

export default new AdjutorService();