import { apiClient } from "./apiClient";
import type { Faq, Testimonial } from "@/utils/types";

export const contentService = {
  async getTestimonials(): Promise<Testimonial[]> {
    const response = await apiClient.get<Testimonial[]>("/api/content/testimonials");
    return response.data;
  },

  async getFaqs(): Promise<Faq[]> {
    const response = await apiClient.get<Faq[]>("/api/content/faqs");
    return response.data;
  },
};
