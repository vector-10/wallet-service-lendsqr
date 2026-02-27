import axios from "axios";

class AdjutorService {
  private baseUrl = process.env.ADJUTOR_BASE_URL;
  private apiKey = process.env.ADJUTOR_API_KEY;

  private get headers() {
    return {
      Authorization: `Bearer ${this.apiKey}`,
    };
  }

  async checkKarmaBlacklist(bvn: string): Promise<boolean> {

    try {
      const response = await axios.get(
        `${this.baseUrl}/verification/karma/${bvn}`,
        { headers: this.headers },
      );
      if (response.data?.["mock-response"]) return false;
      console.log('Adjutor response:', JSON.stringify(response.data));
      return response.data?.data !== null && response.data?.data !== undefined;
    } catch (error: any) {
      if (error.response?.status === 404) return false;
      throw new Error(
        "Identity verification failed. Please try again later or contact support.",
      );
    }
  }
}

export default new AdjutorService();
